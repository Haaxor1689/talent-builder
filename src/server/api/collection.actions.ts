'use server';

import { and, eq } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import { z } from 'zod';

import { db } from '#server/db/index.ts';
import { collections, collectionTrees } from '#server/db/schema.ts';
import { serverFunction } from '#server/helpers.ts';
import { CollectionForm, CollectionsFilters } from '#server/schemas.ts';
import { canEdit, canView } from '#utils/auth.ts';
import { Errors } from '#utils/errors.ts';

import { columns, createdBy, getUser, uniqueSlugException } from '.';

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
						where: { name: { like: `%${input.from}%` } },
						...columns('id')
					})
				).map(a => a.id)
			: [];

		if (input.from && !whereAcc.length)
			return { items: [], nextCursor: undefined };

		const items = await db.query.collections.findMany({
			limit: limit + 1,
			offset,
			orderBy: { updatedAt: 'desc' },
			where: {
				AND: [
					{ visibility: !isAdmin ? 'public' : undefined },
					{ name: input.name ? { like: `%${input.name}%` } : undefined },
					{ createdById: whereAcc.length ? { in: whereAcc } : undefined }
				]
			},
			with: createdBy
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
			where: { id: input.id }
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
			where: { id: input.id }
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
			where: { id: input.collectionId }
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
			where: { id: input.collectionId }
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
			where: { treeId: input.treeId },
			with: { collection: { with: createdBy } }
		}),
	transform: async items => {
		const user = await getUser();
		return items.filter(
			(
				i
			): i is Omit<typeof i, 'collection'> & {
				collection: NonNullable<typeof i.collection>;
			} => canView(user, i.collection)
		);
	}
});

export const listEditableCollections = serverFunction({
	query: async () =>
		await db.query.collections.findMany({
			with: createdBy
		}),
	transform: async collections => {
		const user = await getUser('supporter');
		return collections.filter(c => canEdit(user, c));
	}
});
