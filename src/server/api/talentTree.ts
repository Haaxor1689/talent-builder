import { cacheLife, cacheTag } from 'next/cache';
import { eq, or } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '#server/db/index.ts';
import { talentTrees } from '#server/db/schema.ts';
import { serverFunction } from '#server/helpers.ts';
import { TalentForm } from '#server/schemas.ts';

import { createdBySelect } from '.';

export const getTalentTree = serverFunction({
	input: z.object({ slugOrId: z.string().optional() }),
	query: async input => {
		'use cache';
		cacheLife('weeks');

		if (!input?.slugOrId) return undefined;

		const r = await db.query.talentTrees
			.findFirst({
				where: or(
					eq(talentTrees.id, input.slugOrId),
					eq(talentTrees.slug, input.slugOrId)
				),
				with: { createdBy: createdBySelect }
			})
			.then(tree => (tree ? TalentForm.parse(tree) : undefined));

		if (r) cacheTag('talentTrees', `talentTrees:id:${r.id}`);
		return r;
	}
});
