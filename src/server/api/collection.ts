import { cacheLife, cacheTag } from 'next/cache';
import { z } from 'zod';

import {
	collectionTags,
	missingTag,
	tagDependencies,
	treeTags
} from '#server/cacheTags.ts';
import { db } from '#server/db/index.ts';
import { serverFunction } from '#server/helpers.ts';
import { TalentForm } from '#server/schemas.ts';
import { canView } from '#utils/auth.ts';

import { columns, createdBy, getUser, slugOrId } from '.';

const findCollectionByIdOrSlug = (value: string) =>
	db.query.collections.findFirst({
		where: slugOrId(value),
		...columns('id', 'assignedTrees', 'createdById')
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
		if (!collection) {
			cacheTag(missingTag('collections', input.collection));
			return undefined;
		}
		tagDependencies(collectionTags(collection));
		const treeId = collection.assignedTrees[key];
		if (!treeId) return undefined;

		const tree = await db.query.talentTrees.findFirst({
			where: { id: treeId }
		});
		if (tree) tagDependencies(treeTags(tree));
		else cacheTag(missingTag('talentTrees', treeId));
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
			where: slugOrId(input.slugOrId),
			with: createdBy
		});
		if (r) tagDependencies(collectionTags(r));
		else cacheTag(missingTag('collections', input.slugOrId));
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
		if (!collection) {
			cacheTag(missingTag('collections', input.slugOrId));
			return [];
		}
		tagDependencies(collectionTags(collection));

		const items = await db.query.collectionTrees.findMany({
			where: { collectionId: collection.id },
			with: { tree: { with: createdBy } }
		});
		for (const item of items) {
			cacheTag(
				`collections:id:${item.collectionId}`,
				`talentTrees:id:${item.treeId}`
			);
			if (item.tree) tagDependencies(treeTags(item.tree));
			else cacheTag(missingTag('talentTrees', item.treeId));
		}
		return items
			.filter(item => item.tree)
			.map(item => TalentForm.parse(item.tree));
	},
	transform: async items => {
		const user = await getUser();
		return items.filter(i => canView(user, i));
	}
});
