'use server';

import { updateTag } from 'next/cache';
import { and, asc, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { db } from '#server/db/index.ts';
import { talentTrees } from '#server/db/schema.ts';
import { serverFunction } from '#server/helpers.ts';
import { Talent } from '#server/schemas.ts';
import { safeJsonParse } from '#utils/index.ts';

import { getUser } from '.';
import { FallbackCollection } from './collection';
import { turtleWoWAccountId } from './general';

export const importCollection = serverFunction({
	input: z.object({ collection: z.string(), json: z.string() }),
	session: () => getUser('admin').then(() => true),
	query: async input => {
		const DbTalent = z.object({
			id: z.number(),
			icon: z.string(),
			name_enUS: z.string(),
			ranks: z.number(),
			description_enUS: z.array(z.array(z.string())),
			requires: z.number().optional(),
			spellIds: z.array(z.number())
		});

		const DbTalentTree = z.object({
			icon: z.string(),
			name_enUS: z.string(),
			class: z.number(),
			index: z.number(),
			talents: z.array(DbTalent.nullable()).length(4 * 7)
		});

		const trees = safeJsonParse({
			text: input.json,
			schema: z.array(DbTalentTree),
			errorMessage: 'Invalid input'
		});

		// TODO: test if this still works
		const turtleWoW = await turtleWoWAccountId();
		for (const tree of trees) {
			const rows = 7;

			const exists = await db.query.talentTrees.findFirst({
				where: and(
					eq(talentTrees.collection, input.collection),
					eq(talentTrees.class, tree.class),
					eq(talentTrees.index, tree.index)
				)
			});

			const talents = Object.fromEntries(
				tree.talents
					.map((t, idx) => {
						if (!t) return null;

						const arr = t.description_enUS ?? [];
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
									if (
										!words[0]?.[0] ||
										words.every(w => w[0] === words[0]?.[0])
									) {
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

						return [
							idx.toString(),
							Talent.parse({
								...t,
								name: t.name_enUS,
								description,
								highlight: false,
								spellIds: t.spellIds.join(','),
								requires
							})
						] as const;
					})
					.filter(v => !!v)
			);

			if (exists) {
				await db
					.update(talentTrees)
					.set({
						...tree,
						rows,
						name: tree.name_enUS,
						talents,
						updatedAt: new Date()
					})
					.where(eq(talentTrees.id, exists.id));
				updateTag(`talentTrees:id:${exists.id}`);
			} else
				await db.insert(talentTrees).values({
					...tree,
					rows,
					name: tree.name_enUS,
					id: nanoid(10),
					talents,
					collection: input.collection,
					createdById: turtleWoW,
					createdAt: new Date(),
					updatedAt: new Date()
				});
		}
		updateTag(`collections:${input.collection}`);
	}
});

export const exportCollection = serverFunction({
	input: z.object({ collection: z.string() }),
	session: () => getUser('admin').then(() => true),
	query: async input => {
		let trees = await db.query.talentTrees.findMany({
			where: eq(talentTrees.collection, input.collection),
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
