import { cacheLife, cacheTag } from 'next/cache';
import { z } from 'zod';

import { db } from '#server/db/index.ts';
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
			where: { id: input.id },
			with: {
				trees: { orderBy: { updatedAt: 'desc' } },
				builds: { orderBy: { updatedAt: 'desc' } },
				collections: { orderBy: { updatedAt: 'desc' } }
			}
		});
	}
});
