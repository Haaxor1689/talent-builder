'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { icons, talentTrees, users } from '~/server/db/schema';
import { getTalentSum } from '~/utils';

import { publicProcedure } from '../helpers';

export const getOgInfo = publicProcedure({
	input: z.string(),
	queryKey: 'getOgInfo',
	query: async ({ db, input }) => {
		const talentTree = await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input)
		});

		if (!talentTree) return null;

		// Tree icon
		const icon = await db.query.icons.findFirst({
			where: eq(icons.name, talentTree.icon)
		});
		const iconSrc = `data:image/png;base64,${icon?.data}`;

		// User
		const user = await db.query.users.findFirst({
			where: eq(users.id, talentTree.createdById)
		});

		return {
			icon: iconSrc,
			name: talentTree.name,
			sum: getTalentSum(talentTree.tree),
			user: {
				name: user?.name,
				image: user?.image
			}
		};
	}
});
