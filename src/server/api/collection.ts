import { cacheLife, cacheTag } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '#server/db/index.ts';
import { talentTrees } from '#server/db/schema.ts';
import { serverFunction } from '#server/helpers.ts';

import { createdBySelect, getUser } from '.';

export const FallbackCollection = '1.18.1';

export const listCollections = serverFunction({
	query: async () => {
		'use cache';
		cacheLife('weeks');
		cacheTag('collections', 'collections:list');

		const response = await db
			.selectDistinct({ collection: talentTrees.collection })
			.from(talentTrees);

		return response
			.map(t => t.collection)
			.filter(v => v !== null && !v.startsWith('_'));
	}
});

export const getCollectionTree = serverFunction({
	input: z.object({
		collection: z.string(),
		class: z.number(),
		index: z.number()
	}),
	session: () => getUser().then(u => u?.role === 'admin'),
	query: async (input, isAdmin) => {
		'use cache';
		cacheLife('weeks');
		cacheTag('collections', `collections:id:${input.collection}`);

		let tree = await db.query.talentTrees.findFirst({
			where: and(
				eq(talentTrees.collection, input.collection),
				eq(talentTrees.class, input.class),
				eq(talentTrees.index, input.index),
				isAdmin ? undefined : eq(talentTrees.visibility, 'public')
			),
			with: { createdBy: createdBySelect }
		});
		tree ??= await db.query.talentTrees.findFirst({
			where: and(
				eq(talentTrees.collection, FallbackCollection),
				eq(talentTrees.class, input.class),
				eq(talentTrees.index, input.index)
			),
			with: { createdBy: createdBySelect }
		});
		return tree;
	}
});
