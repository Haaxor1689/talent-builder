import { cacheLife, cacheTag } from 'next/cache';
import { z } from 'zod';

import { missingTag, tagDependencies, treeTags } from '#server/cacheTags.ts';
import { db } from '#server/db/index.ts';
import { serverFunction } from '#server/helpers.ts';
import { TalentForm } from '#server/schemas.ts';

import { createdBy, slugOrId } from '.';

export const getTalentTree = serverFunction({
	input: z.object({ slugOrId: z.string().optional() }),
	query: async input => {
		'use cache';
		cacheLife('weeks');

		if (!input?.slugOrId) return undefined;

		const r = await db.query.talentTrees
			.findFirst({
				where: slugOrId(input.slugOrId),
				with: createdBy
			})
			.then(tree => (tree ? TalentForm.parse(tree) : undefined));

		if (r) tagDependencies(treeTags(r));
		else cacheTag(missingTag('talentTrees', input.slugOrId));
		return r;
	}
});
