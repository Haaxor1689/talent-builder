'use server';

import { and, desc, eq, not } from 'drizzle-orm';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { omit } from 'lodash-es';

import { talentTrees, users } from '~/server/db/schema';

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
				createdAt: new Date()
			});
			return;
		}

		if (session.user.id !== entry.createdById) throw new Error('UNAUTHORIZED');

		await db
			.update(talentTrees)
			.set(omit(input, ['createdById', 'createdAt']))
			.where(eq(talentTrees.id, input.id));

		if (entry.public || input.public) {
			revalidateTag(getTag('listPublicTalentTrees', undefined));
		}
		revalidateTag(getTag('getTalentTree', input.id));
		revalidateTag(getTag('getOgInfo', input.id));
	}
});

export const listTurtleTalentTrees = publicProcedure({
	query: async ({ db }) => {
		const turtleAcc = await db.query.users.findFirst({
			where: eq(users.name, 'TurtleWoW')
		});
		return db.query.talentTrees.findMany({
			orderBy: [desc(talentTrees.updatedAt)],
			where: eq(talentTrees.createdById, turtleAcc?.id ?? ''),
			with: { createdBy: true }
		});
	},
	queryKey: 'listTurtleTalentTrees'
});

export const listPublicTalentTrees = publicProcedure({
	query: async ({ db }) => {
		const turtleAcc = await db.query.users.findFirst({
			where: eq(users.name, 'TurtleWoW')
		});
		return db.query.talentTrees.findMany({
			orderBy: [desc(talentTrees.updatedAt)],
			where: and(
				eq(talentTrees.public, true),
				not(eq(talentTrees.createdById, turtleAcc?.id ?? ''))
			),
			with: { createdBy: true }
		});
	},
	queryKey: 'listPublicTalentTrees'
});

export const listPersonalTalentTrees = protectedProcedure({
	query: async ({ db, session }) =>
		db.query.talentTrees.findMany({
			orderBy: [desc(talentTrees.updatedAt)],
			where: eq(talentTrees.createdById, session.user.id),
			with: { createdBy: true }
		})
});

export const getTalentTree = publicProcedure({
	input: z.string(),
	queryKey: 'getTalentTree',
	query: async ({ db, input }) =>
		db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input),
			with: { createdBy: true }
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
