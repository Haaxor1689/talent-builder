import { cacheLife, cacheTag } from 'next/cache';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '#server/db/index.ts';
import {
	savedBuilds,
	talentTrees,
	user as userTable
} from '#server/db/schema.ts';
import { serverFunction } from '#server/helpers.ts';

export const getUser = serverFunction({
	input: z.object({
		id: z.string()
	}),
	query: async input => {
		'use cache';
		cacheLife('weeks');
		cacheTag('users', `users:id:${input.id}`);

		return await db.query.user.findFirst({
			where: eq(userTable.id, input.id),
			with: {
				trees: { orderBy: [desc(talentTrees.updatedAt)] },
				builds: { orderBy: [desc(savedBuilds.updatedAt)] }
			}
		});
	}
});
