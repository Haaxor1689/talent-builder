import { cacheLife } from 'next/cache';
import { eq } from 'drizzle-orm';

import { db } from '#server/db/index.ts';
import { user } from '#server/db/schema.ts';
import { serverFunction } from '#server/helpers.ts';

export const turtleWoWAccountId = serverFunction({
	query: async () => {
		'use cache';
		cacheLife('max');
		const turtleAcc = await db.query.user.findFirst({
			where: eq(user.name, 'TurtleWoW')
		});
		return turtleAcc?.id ?? '';
	}
});
