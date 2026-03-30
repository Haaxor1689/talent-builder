import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { z } from 'zod';

import { db } from '#server/db/index.ts';
import { serverFunction } from '#server/helpers.ts';

import { createdBy } from '.';

export const getOgInfo = serverFunction({
	input: z.object({ id: z.string() }),
	query: async input => {
		'use cache';
		cacheLife('weeks');
		cacheTag('talentTrees', `talentTrees:id:${input.id}`);

		const talentTree = await db.query.talentTrees.findFirst({
			where: { id: input.id },
			with: createdBy
		});

		if (!talentTree) return null;

		return {
			icon: talentTree.icon,
			name: talentTree.name,
			createdBy: talentTree.createdBy
		};
	}
});
