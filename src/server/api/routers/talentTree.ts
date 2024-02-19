'use server';

import { and, desc, eq, ilike, inArray, like, not } from 'drizzle-orm';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { omit } from 'lodash-es';

import { talentTrees, users } from '~/server/db/schema';

import { Filters, TalentForm } from '../types';
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
			return await db.query.talentTrees.findFirst({
				where: eq(talentTrees.id, input.id)
			});
		}

		if (session.user.id !== entry.createdById) throw new Error('UNAUTHORIZED');

		await db
			.update(talentTrees)
			.set(omit(input, ['createdBy', 'createdById', 'createdAt']))
			.where(eq(talentTrees.id, input.id));

		if (entry.public || input.public) {
			revalidateTag(getTag('listPublicTalentTrees', undefined));
		}
		revalidateTag(getTag('getTalentTree', input.id));
		revalidateTag(getTag('getOgInfo', input.id));

		return await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input.id)
		});
	}
});

export const listTurtleTalentTrees = publicProcedure({
	input: Filters,
	queryKey: 'listTurtleTalentTrees',
	query: async ({ input, db }) => {
		if (input.from) return [];

		const turtleAcc = await db.query.users.findFirst({
			where: eq(users.name, 'TurtleWoW')
		});
		return db.query.talentTrees.findMany({
			orderBy: [desc(talentTrees.class)],
			where: and(
				eq(talentTrees.createdById, turtleAcc?.id ?? ''),
				input.name ? like(talentTrees.name, `%${input.name}%`) : undefined,
				input.class ? eq(talentTrees.class, input.class) : undefined
			),
			with: { createdBy: true }
		});
	}
});

export const listPublicTalentTrees = publicProcedure({
	input: Filters,
	queryKey: 'listPublicTalentTrees',
	query: async ({ input, db }) => {
		const turtleAcc = await db.query.users.findFirst({
			where: eq(users.name, 'TurtleWoW')
		});

		const whereAcc = input.from
			? (
					await db.query.users.findMany({
						where: like(users.name, `%${input.from}%`)
					})
			  ).map(a => a.id)
			: [];

		if (input.from && !whereAcc.length) return [];

		return db.query.talentTrees.findMany({
			orderBy: [desc(talentTrees.updatedAt)],
			where: and(
				eq(talentTrees.public, true),
				not(eq(talentTrees.createdById, turtleAcc?.id ?? '')),
				input.name ? like(talentTrees.name, `%${input.name}%`) : undefined,
				whereAcc.length
					? inArray(talentTrees.createdById, whereAcc)
					: undefined,
				input.class ? eq(talentTrees.class, input.class) : undefined
			),
			with: { createdBy: true }
		});
	}
});

export const listPersonalTalentTrees = protectedProcedure({
	input: Filters,
	query: async ({ input, db, session }) => {
		if (input.from && !session.user.name?.match(input.from)) return [];
		return db.query.talentTrees.findMany({
			orderBy: [desc(talentTrees.updatedAt)],
			where: and(
				eq(talentTrees.createdById, session.user.id),
				input.name ? like(talentTrees.name, `%${input.name}%`) : undefined,
				input.class ? eq(talentTrees.class, input.class) : undefined
			),
			with: { createdBy: true }
		});
	}
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
