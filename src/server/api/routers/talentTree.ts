'use server';

import 'server-only';

import { and, asc, desc, eq, inArray, like, or } from 'drizzle-orm';
import { z } from 'zod';
import { revalidatePath, revalidateTag } from 'next/cache';
import { omit } from 'lodash-es';

import { talentTrees, users } from '~/server/db/schema';

import { Filters, TalentForm } from '../types';
import {
	createdBySelect,
	getFullTag,
	getQueryTag,
	protectedProcedure,
	publicProcedure
} from '../helpers';

import { turtleWoWAccountId } from './general';

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
		} else {
			if (!session.user.isAdmin && session.user.id !== entry.createdById)
				throw new Error('UNAUTHORIZED');

			await db
				.update(talentTrees)
				.set({
					...omit(input, ['createdBy', 'createdById', 'createdAt']),
					updatedAt: new Date()
				})
				.where(eq(talentTrees.id, input.id));
		}

		if (entry?.public || input.public) {
			revalidateTag(getQueryTag('listPublicTalentTrees'));
			revalidateTag(getQueryTag('listInfiniteTalentTrees'));
		}

		const turtleAccId = await turtleWoWAccountId(undefined);
		if (input?.createdById === turtleAccId) {
			revalidateTag(getQueryTag('listTurtleTalentTrees'));
		}

		revalidateTag(getFullTag('getTalentTree', input.id));
		revalidateTag(getFullTag('getOgInfo', input.id));
		revalidatePath(`/api/og/${input.id}`);

		if (input.collection) revalidateTag(getQueryTag('getCollectionTree'));

		return await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input.id)
		});
	}
});

export const listInfiniteTalentTrees = publicProcedure({
	input: Filters.extend({
		limit: z.number().min(1).max(100).optional(),
		cursor: z.number().optional()
	}),
	sessionType: 'role',
	query: async ({ input, db, session }) => {
		const { limit = 32, cursor: offset = 0 } = input;

		const whereAcc = input.from
			? (
					await db.query.users.findMany({
						where: like(users.name, `%${input.from}%`),
						columns: { id: true }
					})
			  ).map(a => a.id)
			: [];

		if (input.from && !whereAcc.length)
			return { items: [], nextCursor: undefined };

		const items = await db.query.talentTrees.findMany({
			limit: limit + 1,
			offset,
			orderBy:
				input.sort === 'class'
					? [
							asc(talentTrees.class),
							asc(talentTrees.index),
							desc(talentTrees.updatedAt)
					  ]
					: [desc(talentTrees.updatedAt)],
			where: and(
				!session?.user.isAdmin
					? or(
							eq(talentTrees.public, true),
							session?.user.id
								? eq(talentTrees.createdById, session?.user.id)
								: undefined
					  )
					: undefined,
				input.name ? like(talentTrees.name, `%${input.name}%`) : undefined,
				session?.user.id && input.onlyPersonal
					? eq(talentTrees.createdById, session.user.id)
					: whereAcc.length
					? inArray(talentTrees.createdById, whereAcc)
					: undefined,
				input.class ? eq(talentTrees.class, input.class) : undefined,
				input.collection
					? eq(talentTrees.collection, input.collection)
					: undefined
			),
			with: { createdBy: createdBySelect }
		});

		const hasMore = items.length > limit;
		if (hasMore) items.pop();
		return {
			items,
			nextCursor: hasMore ? offset + items.length : undefined
		};
	}
});

export const getTalentTree = publicProcedure({
	input: z.string().optional(),
	queryKey: 'getTalentTree',
	query: async ({ db, input }) => {
		if (!input) return undefined;

		return await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input),
			with: { createdBy: createdBySelect }
		});
	}
});

export const deleteTalentTree = protectedProcedure({
	input: z.string(),
	query: async ({ input, db, session }) => {
		const entry = await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input)
		});

		if (!entry) throw new Error('NOT_FOUND');

		if (!session.user.isAdmin && session.user.id !== entry?.createdById)
			throw new Error('UNAUTHORIZED');

		await db.delete(talentTrees).where(eq(talentTrees.id, input));

		if (entry.public) {
			revalidateTag(getQueryTag('listPublicTalentTrees'));
			revalidateTag(getQueryTag('listInfiniteTalentTrees'));
		}

		const turtleAccId = await turtleWoWAccountId(undefined);
		if (entry.createdById === turtleAccId) {
			revalidateTag(getQueryTag('listTurtleTalentTrees'));
		}

		revalidateTag(getFullTag('getTalentTree', entry.id));
		revalidateTag(getFullTag('getOgInfo', entry.id));
		revalidatePath(`/api/og/${entry.id}`);
	}
});
