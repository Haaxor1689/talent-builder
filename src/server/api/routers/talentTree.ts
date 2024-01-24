'use server';

import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';

import { talentTrees } from '~/server/db/schema';

import { TalentForm } from '../types';
import { getTag, protectedProcedure, publicProcedure } from '../helpers';

export const upsertTalentTree = protectedProcedure({
	input: TalentForm,
	query: async ({ input, db, session }) => {
		const entry = await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input.id)
		});

		if (!entry) {
			await db.insert(talentTrees).values({
				...input,
				createdById: session.user.id,
				createdAt: new Date(),
				updatedAt: new Date()
			});
			return;
		}

		if (session.user.id !== entry.createdById) throw new Error('UNAUTHORIZED');

		await db
			.update(talentTrees)
			.set({
				...input,
				updatedAt: new Date()
			})
			.where(eq(talentTrees.id, input.id));

		if (entry.public || input.public) {
			revalidateTag(getTag('listPublicTalentTrees', undefined));
		}
		revalidateTag(getTag('getTalentTree', input.id));
		revalidateTag(getTag('getOgInfo', input.id));
	}
});

export const listPublicTalentTrees = publicProcedure({
	query: async ({ db }) =>
		db.query.talentTrees.findMany({
			orderBy: [desc(talentTrees.updatedAt)],
			where: eq(talentTrees.public, true)
		}),
	queryKey: 'listPublicTalentTrees'
});

export const listPersonalTalentTrees = protectedProcedure({
	query: async ({ db, session }) =>
		db.query.talentTrees.findMany({
			orderBy: [desc(talentTrees.updatedAt)],
			where: eq(talentTrees.createdById, session.user.id)
		})
});

export const getTalentTree = publicProcedure({
	input: z.string(),
	queryKey: 'getTalentTree',
	query: async ({ db, input }) =>
		db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input)
		})
});

export const deleteTalentTree = protectedProcedure({
	input: z.string(),
	query: async ({ input, db, session }) => {
		const entry = await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input)
		});

		if (!entry) throw new Error('NOT_FOUND');

		if (session.user.id !== entry?.createdById) throw new Error('UNAUTHORIZED');

		await db.delete(talentTrees).where(eq(talentTrees.id, input));

		if (entry.public) {
			revalidateTag(getTag('listPublicTalentTrees', undefined));
		}
	}
});
