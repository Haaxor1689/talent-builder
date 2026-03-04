'use server';

import 'server-only';

import { eq } from 'drizzle-orm';

import { user } from '#server/db/schema.ts';

import { publicProcedure } from '../helpers';

export const turtleWoWAccountId = publicProcedure({
	queryKey: 'turtleWoWAccountId',
	query: async ({ db }) => {
		const turtleAcc = await db.query.user.findFirst({
			where: eq(user.name, 'TurtleWoW')
		});
		return turtleAcc?.id ?? '';
	}
});
