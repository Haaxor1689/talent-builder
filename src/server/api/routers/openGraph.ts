'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { talentTrees } from '~/server/db/schema';
import { getTalentSum } from '~/utils';

import { publicProcedure } from '../helpers';

export const getOgInfo = publicProcedure({
	input: z.string(),
	queryKey: 'getOgInfo',
	query: async ({ db, input }) => {
		const talentTree = await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input),
			with: {
				createdBy: true,
				iconSource: true
			}
		});

		if (!talentTree) return null;

		// Tree icon
		const iconSrc = !talentTree.iconSource
			? `https://wow.zamimg.com/images/wow/icons/large/${talentTree.icon}.jpg`
			: `data:image/png;base64,${talentTree.iconSource.data}`;

		// User
		const { name, image } = talentTree.createdBy;

		return {
			icon: iconSrc,
			name: talentTree.name,
			sum: getTalentSum(talentTree.tree),
			user: { name, image }
		};
	}
});
