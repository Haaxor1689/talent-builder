'use server';

import 'server-only';

import { and, asc, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { talentTrees } from '~/server/db/schema';

import { adminProcedure, publicProcedure } from '../helpers';
import { Talent } from '../types';

import { turtleWoWAccountId } from './general';

const FallbackCollection = 'class-changes-2';

export const listCollections = publicProcedure({
	queryKey: 'listCollections',
	query: async ({ db }) => {
		const response = await db
			.selectDistinct({ collection: talentTrees.collection })
			.from(talentTrees);
		return response
			.map(t => t.collection)
			.filter(v => v !== null && !v.startsWith('_'));
	}
});

export const getCollectionTree = publicProcedure({
	input: z.object({
		collection: z.string(),
		class: z.number(),
		index: z.number()
	}),
	queryKey: 'getCollectionTree',
	query: async ({ db, input }) =>
		(await db.query.talentTrees.findFirst({
			where: and(
				eq(talentTrees.collection, input.collection),
				eq(talentTrees.class, input.class),
				eq(talentTrees.index, input.index)
			),
			with: {
				createdBy: { columns: { name: true, image: true, isAdmin: true } }
			}
		})) ??
		(await db.query.talentTrees.findFirst({
			where: and(
				eq(talentTrees.collection, FallbackCollection),
				eq(talentTrees.class, input.class),
				eq(talentTrees.index, input.index)
			),
			with: {
				createdBy: { columns: { name: true, image: true, isAdmin: true } }
			}
		}))
});

export const importCollection = adminProcedure({
	input: z.object({ collection: z.string(), json: z.string() }),
	query: async ({ input, db }) => {
		if (!input.collection) return;

		const LocalesEnum = z.enum(['en', 'cn', 'es', 'ru', 'pt', 'de']);
		const Localized = <T extends z.ZodTypeAny>(type: T) =>
			z.record(LocalesEnum, type);

		const DbTalent = z.object({
			id: z.number(),
			icon: z.string(),
			name: Localized(z.string()),
			ranks: z.number(),
			description: Localized(z.array(z.array(z.string()))),
			requires: z.number().optional(),
			spellIds: z.array(z.number())
		});

		const DbTalentTree = z.object({
			icon: z.string(),
			name: Localized(z.string()),
			class: z.number(),
			index: z.number(),
			talents: z.array(DbTalent.nullable()).length(4 * 7)
		});

		const trees = z.array(DbTalentTree).safeParse(JSON.parse(input.json));

		if (!trees.success) {
			throw new Error(
				`Invalid input: ${JSON.stringify(trees.error.errors, null, 2)}`
			);
		}

		const turtleWoW = await turtleWoWAccountId(undefined);
		for (const tree of trees.data) {
			const exists = await db.query.talentTrees.findFirst({
				where: and(
					eq(talentTrees.collection, input.collection),
					eq(talentTrees.class, tree.class),
					eq(talentTrees.index, tree.index)
				)
			});

			const talents = tree.talents.map(t => {
				if (!t) return Talent.parse({});

				const arr = t.description.en ?? [];
				const description = (arr[0] ?? [])
					.flatMap((desc, idx) => {
						if (arr.every(v => v[idx] === desc)) return [desc];
						const values = arr.map(d => d[idx] ?? '');
						if (desc.match(/^\d+(\.\d+)? ?(sec|min|hour)?$/))
							return [values.join('/')];

						const words = values.map(v => v.split(' '));

						const joined: string[] = [];
						let strings: string[] = [];
						while (words.some(w => w.length)) {
							if (!words[0]?.[0] || words.every(w => w[0] === words[0]?.[0])) {
								strings.push(words[1]?.[0] ?? '');
								words.forEach(w => w.shift());
								continue;
							}

							const numbers = words.map(
								w => w[0]?.match(/^\d+(\.\d+)?/)?.[0] ?? '?'
							);
							if (numbers.some(n => n === '?')) {
								strings.push(words[1]?.[0] ?? '');
								words.forEach(w => w.shift());
								continue;
							}

							joined.push(`${strings.join(' ')} `);
							joined.push(numbers.join('/'));
							strings = [words[0]?.[0].slice(numbers[0]?.length) ?? ' '];

							words.forEach(w => w.shift());
						}
						joined.push(strings.join(' '));
						return joined;
					})
					.join('');

				const requires = !t.requires
					? null
					: tree.talents.findIndex(r => r?.id === t.requires);

				return {
					...t,
					name: t.name.en ?? '',
					description,
					highlight: false,
					spellIds: t.spellIds.join(','),
					requires
				};
			});

			if (exists)
				await db
					.update(talentTrees)
					.set({ ...tree, name: tree.name.en ?? '', talents })
					.where(eq(talentTrees.id, exists.id));
			else
				await db.insert(talentTrees).values({
					...tree,
					name: tree.name.en ?? '',
					id: nanoid(10),
					talents,
					collection: input.collection,
					createdById: turtleWoW,
					createdAt: new Date()
				});
		}
	}
});

export const exportCollection = adminProcedure({
	input: z.string(),
	query: async ({ db, input }) => {
		if (!input) return '';
		let trees = await db.query.talentTrees.findMany({
			where: eq(talentTrees.collection, input),
			orderBy: [asc(talentTrees.class), asc(talentTrees.index)]
		});

		if (trees.length !== 3 * 9) {
			const fallbackTrees = await db.query.talentTrees.findMany({
				where: eq(talentTrees.collection, FallbackCollection),
				orderBy: [asc(talentTrees.class), asc(talentTrees.index)]
			});
			trees = fallbackTrees.map(
				t => trees.find(tt => tt.class === t.class && tt.index === t.index) ?? t
			);
		}

		return JSON.stringify(
			trees.map(t => ({
				icon: t.icon,
				name: t.name,
				class: t.class,
				index: t.index,
				talents: t.talents.map(l =>
					!l.ranks
						? {}
						: {
								icon: l.icon,
								name: l.name,
								ranks: l.ranks,
								description: l.description,
								requires: l.requires,
								spellIds: l.spellIds
						  }
				)
			}))
		);
	}
});

export const deleteCollection = adminProcedure({
	input: z.string(),
	query: async ({ db, input }) => {
		if (!input) return;
		await db.delete(talentTrees).where(eq(talentTrees.collection, input));
	}
});
