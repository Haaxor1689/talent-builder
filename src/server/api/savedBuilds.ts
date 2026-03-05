import { cacheLife, cacheTag } from 'next/cache';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '#server/db/index.ts';
import { savedBuilds } from '#server/db/schema.ts';
import { serverFunction } from '#server/helpers.ts';

import { createdBySelect, getUser } from './index';

export const getSavedBuild = serverFunction({
	input: z.object({ id: z.string() }),
	query: async input => {
		'use cache';
		cacheLife('weeks');
		cacheTag(`savedBuilds:id:${input.id}`);

		const build = await db.query.savedBuilds.findFirst({
			where: eq(savedBuilds.id, input.id),
			with: { createdBy: createdBySelect }
		});

		if (!build) return null;

		return {
			...build,
			points: build.talents.split('-').map(p => [...p].map(v => Number(v))) as [
				number[],
				number[],
				number[]
			]
		};
	}
});

export const listPersonalSavedBuilds = serverFunction({
	session: () => getUser('user').then(u => u.id),
	query: async (_, userId) => {
		'use cache';
		cacheLife('weeks');
		cacheTag(`savedBuilds:user:${userId}`);
		return await db.query.savedBuilds.findMany({
			orderBy: [asc(savedBuilds.class)],
			where: eq(savedBuilds.createdById, userId),
			with: { createdBy: createdBySelect }
		});
	}
});
