import { cacheLife, cacheTag } from 'next/cache';
import { and, eq, or } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '#server/db/index.ts';
import {
	collections,
	collectionTrees,
	talentTrees
} from '#server/db/schema.ts';
import { serverFunction } from '#server/helpers.ts';
import { TalentForm } from '#server/schemas.ts';
import { canView } from '#utils/auth.ts';

import { createdBySelect, getUser } from '.';

const findCollectionByIdOrSlug = (value: string) =>
	db.query.collections.findFirst({
		where: or(eq(collections.id, value), eq(collections.slug, value)),
		columns: { id: true, assignedTrees: true }
	});

export const getCollectionTree = serverFunction({
	input: z.object({
		collection: z.string(),
		class: z.number(),
		index: z.number()
	}),
	query: async input => {
		'use cache';
		cacheLife('weeks');

		const key = `${input.class}:${input.index}`;

		const collection = await findCollectionByIdOrSlug(input.collection);
		if (!collection?.assignedTrees[key]) return undefined;

		cacheTag('collections', `collections:id:${collection.id}`);

		const tree = await db.query.talentTrees.findFirst({
			where: and(eq(talentTrees.id, collection.assignedTrees[key]))
		});
		return tree ? TalentForm.parse(tree) : undefined;
	},
	transform: async tree => {
		const user = await getUser();
		return canView(user, tree) ? tree : undefined;
	}
});

export const getCollection = serverFunction({
	input: z.object({ slugOrId: z.string() }),
	query: async input => {
		'use cache';
		cacheLife('weeks');

		const r = await db.query.collections.findFirst({
			where: or(
				eq(collections.id, input.slugOrId),
				eq(collections.slug, input.slugOrId)
			),
			with: { createdBy: createdBySelect }
		});
		if (r) cacheTag('collections', `collections:id:${r.id}`);
		return r;
	},
	transform: async collection => {
		if (!collection) return undefined;
		const user = await getUser();
		return canView(user, collection) ? collection : undefined;
	}
});

export const getCollectionTrees = serverFunction({
	input: z.object({ slugOrId: z.string() }),
	query: async input => {
		'use cache';
		cacheLife('weeks');

		const collection = await findCollectionByIdOrSlug(input.slugOrId);
		if (!collection) return [];

		cacheTag('collections', `collections:id:${collection.id}`);

		return await db.query.collectionTrees
			.findMany({
				where: eq(collectionTrees.collectionId, collection.id),
				with: {
					tree: { with: { createdBy: createdBySelect } }
				}
			})
			.then(items => items.map(item => TalentForm.parse(item.tree)));
	},
	transform: async items => {
		const user = await getUser();
		return items.filter(i => canView(user, i));
	}
});
