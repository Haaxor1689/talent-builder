import { cacheLife, cacheTag } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '#server/db/index.ts';
import { talentTrees } from '#server/db/schema.ts';
import { serverFunction } from '#server/helpers.ts';
import { TalentForm } from '#server/schemas.ts';

import { createdBySelect } from '.';

export const getTalentTree = serverFunction({
	input: z.object({ id: z.string().optional() }),
	query: async input => {
		'use cache';
		cacheLife('weeks');

		if (!input?.id) return undefined;

		cacheTag('talentTrees', `talentTrees:id:${input.id}`);

		return await db.query.talentTrees
			.findFirst({
				where: eq(talentTrees.id, input.id),
				with: { createdBy: createdBySelect }
			})
			.then(tree => (tree ? TalentForm.parse(tree) : tree));
	}
});
