'use server';

import { desc, eq, like } from 'drizzle-orm';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';

import { icons, talentTrees } from '~/server/db/schema';

import { adminProcedure, getTag, publicProcedure } from '../helpers';

export const upsertIcon = adminProcedure({
	input: z.object({ name: z.string(), data: z.string() }),
	query: async ({ input, db }) => {
		const entry = await db.query.icons.findFirst({
			where: eq(icons.name, input.name)
		});

		if (!entry) await db.insert(icons).values(input);
		else await db.update(icons).set(input).where(eq(icons.name, input.name));

		revalidateTag(getTag('getIcon', input.name));

		const trees = await db.query.talentTrees.findMany({
			where: eq(talentTrees.icon, input.name)
		});
		trees.forEach(tree => revalidateTag(getTag('getOgInfo', tree.id)));
	}
});

export const listIcons = publicProcedure({
	input: z.object({
		limit: z.number().min(1).max(100).optional(),
		cursor: z.number().optional(),
		filter: z.string().optional()
	}),
	query: async ({ input, db }) => {
		const { limit = 32, cursor: offset = 0 } = input;
		const items = await db.query.icons.findMany({
			limit: limit + 1,
			offset,
			where: input.filter ? like(icons.name, `%${input.filter}%`) : undefined,
			orderBy: [desc(icons.name)]
		});
		const hasMore = items.length > limit;
		if (hasMore) items.pop();
		return {
			items,
			nextCursor: hasMore ? offset + items.length : undefined
		};
	}
});

export const getIcon = publicProcedure({
	input: z.string(),
	queryKey: 'getIcon',
	query: async ({ db, input }) =>
		db.query.icons.findFirst({
			where: eq(icons.name, input)
		})
});

export const deleteIcon = adminProcedure({
	input: z.string(),
	query: async ({ input, db }) => {
		await db.delete(icons).where(eq(icons.name, input));
		revalidateTag(getTag('getIcon', input));
	}
});
