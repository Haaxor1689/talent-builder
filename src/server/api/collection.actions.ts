'use server';

import { updateTag } from 'next/cache';
import { and, desc, eq, inArray, like } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { db } from '#server/db/index.ts';
import {
	collections,
	collectionTrees,
	talentTrees,
	user as userTable
} from '#server/db/schema.ts';
import { serverFunction } from '#server/helpers.ts';
import { CollectionForm, CollectionsFilters } from '#server/schemas.ts';
import { canEdit, canView } from '#utils/auth.ts';
import { Errors } from '#utils/errors.ts';

import { createdBySelect, getUser, uniqueSlugException } from '.';
import { turtleWoWAccountId } from './general';

export const listInfiniteCollections = serverFunction({
	input: CollectionsFilters.extend({
		limit: z.number().min(1).max(100).optional(),
		cursor: z.number().optional()
	}),
	session: () => getUser().then(u => u?.role === 'admin'),
	query: async (input, isAdmin) => {
		const { limit = 32, cursor: offset = 0 } = input;

		const whereAcc = input.from
			? (
					await db.query.user.findMany({
						where: like(userTable.name, `%${input.from}%`),
						columns: { id: true }
					})
				).map(a => a.id)
			: [];

		if (input.from && !whereAcc.length)
			return { items: [], nextCursor: undefined };

		const items = await db.query.collections.findMany({
			limit: limit + 1,
			offset,
			orderBy: [desc(collections.updatedAt)],
			where: and(
				!isAdmin ? eq(collections.visibility, 'public') : undefined,
				input.name ? like(collections.name, `%${input.name}%`) : undefined,
				whereAcc.length ? inArray(collections.createdById, whereAcc) : undefined
			),
			with: { createdBy: createdBySelect }
		});

		const hasMore = items.length > limit;
		if (hasMore) items.pop();

		return {
			items,
			nextCursor: hasMore ? offset + items.length : undefined
		};
	}
});

const updateTags = (id: string, userId: string) => {
	updateTag(`collections:id:${id}`);
	updateTag(`users:id:${userId}`);
};

export const upsertCollection = serverFunction({
	input: CollectionForm,
	session: () => getUser('supporter').then(u => ({ id: u.id, role: u.role })),
	query: async (input, user) => {
		const current = await db.query.collections.findFirst({
			where: eq(collections.id, input.id)
		});

		const now = new Date();
		if (!current) {
			await db
				.insert(collections)
				.values({
					...input,
					createdById: user.id,
					createdAt: now,
					updatedAt: now
				})
				.catch(uniqueSlugException);
		} else {
			if (!canEdit(user, current))
				throw Errors.unauthorized({
					message: 'You do not have permission to edit this collection'
				});

			await db
				.update(collections)
				.set({
					...input,
					createdById: current.createdById,
					createdAt: current.createdAt,
					updatedAt: now
				})
				.where(eq(collections.id, input.id))
				.catch(uniqueSlugException);
		}

		updateTags(input.id, current?.createdById ?? user.id);
	}
});

export const deleteCollection = serverFunction({
	input: z.object({ id: z.string() }),
	session: () => getUser('supporter').then(u => ({ id: u.id, role: u.role })),
	query: async (input, user) => {
		const current = await db.query.collections.findFirst({
			where: eq(collections.id, input.id)
		});

		if (!canEdit(user, current))
			throw Errors.unauthorized({
				message: 'You do not have permission to delete this collection'
			});

		await db.transaction(async tx => {
			await tx
				.delete(collectionTrees)
				.where(eq(collectionTrees.collectionId, input.id));
			await tx.delete(collections).where(eq(collections.id, input.id));
		});

		updateTags(input.id, current?.createdById ?? user.id);
	}
});

export const addCollectionTree = serverFunction({
	input: z.object({ collectionId: z.string(), treeId: z.string() }),
	session: () => getUser('user').then(u => ({ id: u.id, role: u.role })),
	query: async (input, user) => {
		const current = await db.query.collections.findFirst({
			where: eq(collections.id, input.collectionId)
		});
		if (!current) throw Errors.generic({ message: 'Collection not found' });
		if (!canEdit(user, current))
			throw Errors.unauthorized({
				message: 'You do not have permission to edit this collection'
			});

		await db.transaction(async tx => {
			await tx.insert(collectionTrees).values({
				collectionId: input.collectionId,
				treeId: input.treeId
			});

			await tx
				.update(collections)
				.set({ updatedAt: new Date() })
				.where(eq(collections.id, input.collectionId));
		});

		updateTags(input.collectionId, current.createdById);
	}
});

export const removeCollectionTree = serverFunction({
	input: z.object({ collectionId: z.string(), treeId: z.string() }),
	session: () => getUser('user').then(u => ({ id: u.id, role: u.role })),
	query: async (input, user) => {
		const current = await db.query.collections.findFirst({
			where: eq(collections.id, input.collectionId)
		});
		if (!current) throw Errors.generic({ message: 'Collection not found' });
		if (!canEdit(user, current))
			throw Errors.unauthorized({
				message: 'You do not have permission to edit this collection'
			});

		// Find if the tree is assigned to any slot and remove it from there
		const assigned = Object.entries(current.assignedTrees).find(
			([, treeId]) => treeId === input.treeId
		)?.[0];
		const assignedTrees = { ...current.assignedTrees };
		if (assigned) delete assignedTrees[assigned];

		await db.transaction(async tx => {
			await tx
				.delete(collectionTrees)
				.where(
					and(
						eq(collectionTrees.collectionId, input.collectionId),
						eq(collectionTrees.treeId, input.treeId)
					)
				);

			await tx
				.update(collections)
				.set({ assignedTrees, updatedAt: new Date() })
				.where(eq(collections.id, input.collectionId));
		});

		updateTags(input.collectionId, current.createdById);
	}
});

export const listTreeCollections = serverFunction({
	input: z.object({ treeId: z.string() }),
	query: async input =>
		await db.query.collectionTrees.findMany({
			where: eq(collectionTrees.treeId, input.treeId),
			with: { collection: { with: { createdBy: true } } }
		}),
	transform: async items => {
		const user = await getUser();
		return items.filter(i => canView(user, i.collection));
	}
});

export const listEditableCollections = serverFunction({
	query: async () =>
		await db.query.collections.findMany({
			with: { createdBy: createdBySelect }
		}),
	transform: async collections => {
		const user = await getUser('supporter');
		return collections.filter(c => canEdit(user, c));
	}
});

export const importCollection = serverFunction({
	input: z.object({ collection: z.string(), json: z.string() }),
	session: () => getUser('admin').then(() => true),
	query: async input => {
		// const DbTalent = z.object({
		// 	id: z.number(),
		// 	icon: z.string(),
		// 	name_enUS: z.string(),
		// 	ranks: z.number(),
		// 	description_enUS: z.array(z.array(z.string())),
		// 	requires: z.number().optional(),
		// 	spellIds: z.array(z.number())
		// });

		// const DbTalentTree = z.object({
		// 	icon: z.string(),
		// 	name_enUS: z.string(),
		// 	class: z.number(),
		// 	index: z.number(),
		// 	talents: z.array(DbTalent.nullable()).length(4 * 7)
		// });

		// const trees = safeJsonParse({
		// 	text: input.json,
		// 	schema: z.array(DbTalentTree),
		// 	errorMessage: 'Invalid input'
		// });

		const turtleWoW = await turtleWoWAccountId();
		let collection = await db.query.collections.findFirst({
			where: eq(collections.id, input.collection)
		});
		collection ??= await db.query.collections.findFirst({
			where: eq(collections.name, input.collection)
		});

		if (!collection) {
			const id = nanoid(10);
			const now = new Date();
			await db.insert(collections).values({
				id,
				name: input.collection,
				visibility: input.collection.startsWith('_') ? 'private' : 'public',
				createdById: turtleWoW,
				createdAt: now,
				updatedAt: now
			});
			collection = await db.query.collections.findFirst({
				where: eq(collections.id, id)
			});
		}

		if (!collection) throw Errors.generic({ message: 'Collection not found' });

		// for (const tree of trees) {
		// 	const rows = 7;
		// 	const talents = Object.fromEntries(
		// 		tree.talents
		// 			.map((t, idx) => {
		// 				if (!t) return null;

		// 				const arr = t.description_enUS ?? [];
		// 				const description = (arr[0] ?? [])
		// 					.flatMap((desc, idx) => {
		// 						if (arr.every(v => v[idx] === desc)) return [desc];
		// 						const values = arr.map(d => d[idx] ?? '');
		// 						if (desc.match(/^\d+(\.\d+)? ?(sec|min|hour)?$/))
		// 							return [values.join('/')];

		// 						const words = values.map(v => v.split(' '));

		// 						const joined: string[] = [];
		// 						let strings: string[] = [];
		// 						while (words.some(w => w.length)) {
		// 							if (
		// 								!words[0]?.[0] ||
		// 								words.every(w => w[0] === words[0]?.[0])
		// 							) {
		// 								strings.push(words[1]?.[0] ?? '');
		// 								words.forEach(w => w.shift());
		// 								continue;
		// 							}

		// 							const numbers = words.map(
		// 								w => w[0]?.match(/^\d+(\.\d+)?/)?.[0] ?? '?'
		// 							);
		// 							if (numbers.some(n => n === '?')) {
		// 								strings.push(words[1]?.[0] ?? '');
		// 								words.forEach(w => w.shift());
		// 								continue;
		// 							}

		// 							joined.push(`${strings.join(' ')} `);
		// 							joined.push(numbers.join('/'));
		// 							strings = [words[0]?.[0].slice(numbers[0]?.length) ?? ' '];

		// 							words.forEach(w => w.shift());
		// 						}
		// 						joined.push(strings.join(' '));
		// 						return joined;
		// 					})
		// 					.join('');

		// 				const requires = !t.requires
		// 					? null
		// 					: tree.talents.findIndex(r => r?.id === t.requires);

		// 				return [
		// 					idx.toString(),
		// 					Talent.parse({
		// 						...t,
		// 						name: t.name_enUS,
		// 						description,
		// 						highlight: false,
		// 						spellIds: t.spellIds.join(','),
		// 						requires
		// 					})
		// 				] as const;
		// 			})
		// 			.filter(v => !!v)
		// 	);

		// const existingSlot = await db.query.collectionTrees.findFirst({
		// 	where: and(
		// 		eq(collectionTrees.collectionId, collection.id),
		// 		eq(collectionTrees.class, tree.class),
		// 		eq(collectionTrees.tab, tree.index)
		// 	)
		// });

		// if (existingSlot) {
		// 	await db
		// 		.update(talentTrees)
		// 		.set({
		// 			...tree,
		// 			rows,
		// 			name: tree.name_enUS,
		// 			talents,
		// 			updatedAt: new Date()
		// 		})
		// 		.where(eq(talentTrees.id, existingSlot.treeId));
		// } else {
		// 	const id = nanoid(10);
		// 	await db.insert(talentTrees).values({
		// 		...tree,
		// 		id,
		// 		name: tree.name_enUS,
		// 		talents,
		// 		rows,
		// 		collection: null,
		// 		createdById: turtleWoW,
		// 		createdAt: new Date(),
		// 		updatedAt: new Date()
		// 	});
		// 	await db.insert(collectionTrees).values({
		// 		collectionId: collection.id,
		// 		treeId: id
		// 	});
		// }
		// }

		await db
			.update(collections)
			.set({ updatedAt: new Date() })
			.where(eq(collections.id, collection.id));
		updateTags(collection.id, collection.createdById);
	}
});

export const exportCollection = serverFunction({
	input: z.object({ collection: z.string() }),
	session: () => getUser('admin').then(() => true),
	query: async input => {
		let collection = await db.query.collections.findFirst({
			where: eq(collections.id, input.collection)
		});
		collection ??= await db.query.collections.findFirst({
			where: eq(collections.name, input.collection)
		});
		if (!collection) throw Errors.generic({ message: 'Collection not found' });

		const relations = await db.query.talentTrees.findMany({
			where: inArray(talentTrees.id, Object.values(collection.assignedTrees))
		});

		const trees = relations
			.filter((t): t is NonNullable<typeof t> => !!t)
			.sort((a, b) => a.class - b.class || a.index - b.index);

		return JSON.stringify(
			trees.map(t => ({
				icon: t.icon,
				name: t.name,
				class: t.class,
				index: t.index,
				rows: t.rows,
				talents: [...Array(t.rows * 4).keys()].map(i => {
					const l = t.talents[i];
					return !l?.ranks
						? {}
						: {
								icon: l.icon,
								name: l.name,
								ranks: l.ranks,
								description: l.description,
								requires: l.requires,
								spellIds: l.spellIds
							};
				})
			}))
		);
	}
});
