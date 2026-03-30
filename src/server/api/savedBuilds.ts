import { cacheLife, cacheTag } from 'next/cache';
import { eq, or } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '#server/db/index.ts';
import { savedBuilds } from '#server/db/schema.ts';
import { serverFunction } from '#server/helpers.ts';

import { createdBySelect } from './index';

export const getSavedBuild = serverFunction({
	input: z.object({ id: z.string() }),
	query: async input => {
		'use cache';
		cacheLife('weeks');

		const r = await db.query.savedBuilds.findFirst({
			where: or(eq(savedBuilds.id, input.id), eq(savedBuilds.slug, input.id)),
			with: { createdBy: createdBySelect }
		});

		if (r) cacheTag(`savedBuilds:id:${r.id}`);
		else return undefined;

		return {
			...r,
			points: r.talents.split('-').map(p => [...p].map(v => Number(v))) as [
				number[],
				number[],
				number[]
			]
		};
	}
});
