import { desc, eq, like } from 'drizzle-orm';
import { z } from 'zod';

import {
	adminProcedure,
	createTRPCRouter,
	publicProcedure
} from '~/server/api/trpc';
import { icons } from '~/server/db/schema';

export const iconRouter = createTRPCRouter({
	upsert: adminProcedure
		.input(z.object({ name: z.string(), data: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const entry = await ctx.db.query.icons.findFirst({
				where: eq(icons.name, input.name)
			});

			if (!entry) await ctx.db.insert(icons).values(input);
			else await ctx.db.update(icons).set(input);
		}),

	list: publicProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).optional(),
				cursor: z.number().optional(),
				filter: z.string().optional()
			})
		)
		.query(async ({ input, ctx }) => {
			const { limit = 32, cursor: offset = 0 } = input;
			const items = await ctx.db.query.icons.findMany({
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
		}),

	get: publicProcedure.input(z.string()).query(async ({ ctx, input }) =>
		ctx.db.query.icons.findFirst({
			where: eq(icons.name, input)
		})
	),

	delete: adminProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
		await ctx.db.delete(icons).where(eq(icons.name, input));
	})
});
