'use server';

import 'server-only';

import { and, asc, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { talentTrees } from '~/server/db/schema';

import { adminProcedure, publicProcedure } from '../helpers';
import { TalentForm, Talent } from '../types';

import { turtleWoWAccountId } from './general';

export const listCollections = publicProcedure({
	queryKey: 'listCollections',
	query: async ({ db }) => {
		const response = await db
			.selectDistinct({ collection: talentTrees.collection })
			.from(talentTrees);
		return response.map(t => t.collection);
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
		db.query.talentTrees.findFirst({
			where: and(
				eq(talentTrees.collection, input.collection),
				eq(talentTrees.class, input.class),
				eq(talentTrees.index, input.index)
			),
			orderBy: [asc(talentTrees.class), asc(talentTrees.index)],
			with: { createdBy: true }
		})
});

export const importCollection = adminProcedure({
	input: z.object({ collection: z.string(), json: z.string() }),
	query: async ({ input, db }) => {
		if (!input.collection) return;

		const trees = z
			.array(
				TalentForm.omit({ createdAt: true, createdBy: true, createdById: true })
			)
			.safeParse(JSON.parse(input.json));

		if (!trees.success) {
			throw new Error(
				`Invalid input: ${JSON.stringify(trees.error.errors, null, 2)}`
			);
		}

		const turtleWoW = await turtleWoWAccountId(undefined);
		for (const tree of trees.data) {
			const exists = await db.query.talentTrees.findFirst({
				where: and(
					eq(talentTrees.class, tree.class),
					eq(talentTrees.index, tree.index)
				)
			});
			if (exists) {
				await db
					.update(talentTrees)
					.set({
						...tree,
						talents: tree.talents.map(t => (!t ? Talent.parse({}) : t))
					})
					.where(eq(talentTrees.id, exists.id));
			} else {
				await db.insert(talentTrees).values({
					...tree,
					id: nanoid(10),
					talents: tree.talents.map(t => (!t ? Talent.parse({}) : t)),
					collection: input.collection,
					createdById: turtleWoW,
					createdAt: new Date()
				});
			}
		}
	}
});

export const exportCollection = adminProcedure({
	input: z.string(),
	query: async ({ db, input }) => {
		if (!input) return '';
		const trees = await db.query.talentTrees.findMany({
			where: eq(talentTrees.collection, input),
			orderBy: [asc(talentTrees.class), asc(talentTrees.index)]
		});
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
								requires: l.requires
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
