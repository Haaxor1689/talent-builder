import { cacheLife, cacheTag } from 'next/cache';
import { z } from 'zod';

import { db } from '#server/db/index.ts';
import { serverFunction } from '#server/helpers.ts';

import { createdBy, slugOrId } from './index';

export const getSavedBuild = serverFunction({
	input: z.object({ id: z.string() }),
	query: async input => {
		'use cache';
		cacheLife('weeks');

		const r = await db.query.savedBuilds.findFirst({
			where: slugOrId(input.id),
			with: createdBy
		});

		if (r) cacheTag(`savedBuilds:id:${r.id}`);
		else return undefined;

		return {
			...r,
			// oxlint-disable-next-line typescript/no-misused-spread
			points: r.talents.split('-').map(p => [...p].map(v => Number(v))) as [
				number[],
				number[],
				number[]
			]
		};
	}
});
