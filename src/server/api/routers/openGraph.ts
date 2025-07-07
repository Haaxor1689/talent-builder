'use server';

import 'server-only';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { talentTrees } from '~/server/db/schema';
import { getTalentSum } from '~/utils';

import { createdBySelect, publicProcedure } from '../helpers';

export const getOgInfo = publicProcedure({
	input: z.string(),
	queryKey: 'getOgInfo',
	query: async ({ db, input }) => {
		const talentTree = await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input),
			with: { createdBy: createdBySelect }
		});

		if (!talentTree) return null;

		// User
		const { name, image } = talentTree.createdBy;

		return {
			icon: talentTree.icon,
			name: talentTree.name,
			sum: getTalentSum(talentTree.talents),
			user: { name, image }
		};
	}
});
