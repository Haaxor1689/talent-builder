import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '#server/db/index.ts';
import { talentTrees } from '#server/db/schema.ts';
import { serverFunction } from '#server/helpers.ts';

import { createdBySelect } from '.';

export const getOgInfo = serverFunction({
	input: z.object({ id: z.string() }),
	query: async input => {
		'use cache';
		cacheLife('weeks');
		cacheTag('talentTrees', `talentTrees:id:${input.id}`);

		const talentTree = await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input.id),
			with: { createdBy: createdBySelect }
		});

		if (!talentTree) return null;

		// User
		const { name, image, role } = talentTree.createdBy;

		return {
			icon: talentTree.icon,
			name: talentTree.name,
			createdBy: { name, image, role }
		};
	}
});
