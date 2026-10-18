import { cacheLife, cacheTag } from 'next/cache';
import { z } from 'zod';

import {
	buildTags,
	collectionTags,
	missingTag,
	tagDependencies,
	treeTags
} from '#server/cacheTags.ts';
import { db } from '#server/db/index.ts';
import { serverFunction } from '#server/helpers.ts';

export const getUserProfile = serverFunction({
	input: z.object({
		id: z.string()
	}),
	query: async input => {
		'use cache';
		cacheLife('weeks');
		cacheTag(
			'users',
			`talentTrees:owner:${input.id}`,
			`savedBuilds:owner:${input.id}`,
			`collections:owner:${input.id}`
		);

		const user = await db.query.user.findFirst({
			where: { id: input.id },
			with: {
				trees: { orderBy: { updatedAt: 'desc' } },
				builds: { orderBy: { updatedAt: 'desc' } },
				collections: { orderBy: { updatedAt: 'desc' } }
			}
		});
		if (!user) {
			cacheTag(missingTag('users', input.id));
			return undefined;
		}
		cacheTag(`users:id:${user.id}`);
		tagDependencies([
			...user.trees.flatMap(treeTags),
			...user.builds.flatMap(buildTags),
			...user.collections.flatMap(collectionTags)
		]);
		return user;
	}
});
