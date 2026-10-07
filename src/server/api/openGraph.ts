import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { z } from 'zod';

import { db } from '#server/db/index.ts';
import { serverFunction } from '#server/helpers.ts';

import { createdBy, slugOrId } from '.';

export const getOgInfo = serverFunction({
	input: z.object({ id: z.string() }),
	query: async input => {
		'use cache';
		cacheLife('weeks');
		cacheTag('talentTrees');

		const talentTree = await db.query.talentTrees.findFirst({
			where: slugOrId(input.id),
			with: createdBy
		});

		if (!talentTree) return null;
		cacheTag(`talentTrees:id:${talentTree.id}`);

		return {
			id: talentTree.id,
			slug: talentTree.slug,
			icon: talentTree.icon,
			name: talentTree.name,
			createdBy: talentTree.createdBy
		};
	}
});
