import { TRPCError } from '@trpc/server';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import {
	createTRPCRouter,
	protectedProcedure,
	publicProcedure
} from '~/server/api/trpc';
import { talentTrees } from '~/server/db/schema';

import { TalentForm } from '../types';

export const talentTreeRouter = createTRPCRouter({
	upsert: protectedProcedure
		.input(TalentForm)
		.mutation(async ({ ctx, input }) => {
			const entry = await ctx.db.query.talentTrees.findFirst({
				where: eq(talentTrees.id, input.id)
			});

			if (!entry) {
				await ctx.db.insert(talentTrees).values({
					...input,
					createdById: ctx.session.user.id
				});
				return;
			}

			if (ctx.session.user.id !== entry.createdById)
				throw new TRPCError({ code: 'UNAUTHORIZED' });

			await ctx.db.update(talentTrees).set({
				...input,
				updatedAt: new Date()
			});
		}),

	listPublic: publicProcedure.query(async ({ ctx }) =>
		ctx.db.query.talentTrees.findMany({
			orderBy: [desc(talentTrees.updatedAt)],
			where: eq(talentTrees.public, true)
		})
	),

	listPersonal: protectedProcedure.query(async ({ ctx }) =>
		ctx.db.query.talentTrees.findMany({
			orderBy: [desc(talentTrees.updatedAt)],
			where: eq(talentTrees.createdById, ctx.session.user.id)
		})
	),

	get: publicProcedure.input(z.string()).query(async ({ ctx, input }) =>
		ctx.db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input)
		})
	),

	delete: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			if (
				ctx.session.user.id !==
				(
					await ctx.db.query.talentTrees.findFirst({
						where: eq(talentTrees.id, input)
					})
				)?.createdById
			)
				throw new TRPCError({ code: 'UNAUTHORIZED' });

			await ctx.db.delete(talentTrees).where(eq(talentTrees.id, input));
		})
});
