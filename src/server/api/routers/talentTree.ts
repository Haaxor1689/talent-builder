'use server';

import { and, asc, desc, eq, inArray, like, not, or } from 'drizzle-orm';
import { z } from 'zod';
import { revalidatePath, revalidateTag } from 'next/cache';
import { omit } from 'lodash-es';

import { proposalTrees, talentTrees, users } from '~/server/db/schema';

import { Filters, TalentForm } from '../types';
import {
	adminProcedure,
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
	queryKey: 'listInfiniteTalentTrees',
	query: async ({ input, db, session }) => {
		const { limit = 32, cursor: offset = 0 } = input;

		const whereAcc = input.from
			? (
					await db.query.users.findMany({
						where: like(users.name, `%${input.from}%`)
					})
			  ).map(a => a.id)
			: [];

		if (input.from && !whereAcc.length)
			return { items: [], nextCursor: undefined };

		const turtleAccId = await turtleWoWAccountId(undefined);

		const items = await db.query.talentTrees.findMany({
			limit: limit + 1,
			offset,
			orderBy: [desc(talentTrees.updatedAt)],
			where: and(
				or(
					eq(talentTrees.public, true),
					session?.user.id
						? eq(talentTrees.createdById, session?.user.id)
						: undefined
				),
				input.name ? like(talentTrees.name, `%${input.name}%`) : undefined,
				whereAcc.length
					? inArray(talentTrees.createdById, whereAcc)
					: undefined,
				input.class ? eq(talentTrees.class, input.class) : undefined,
				!session ? eq(talentTrees.createdById, turtleAccId) : undefined
			),
			with: { createdBy: true }
		});

		const hasMore = items.length > limit;
		if (hasMore) items.pop();
		return {
			items,
			nextCursor: hasMore ? offset + items.length : undefined
		};
	},
	sessionType: 'any'
});

export const listTurtleTalentTrees = publicProcedure({
	input: Filters,
	queryKey: 'listTurtleTalentTrees',
	query: async ({ input, db }) => {
		if (input.from) return [];

		const turtleAccId = await turtleWoWAccountId(undefined);
		return db.query.talentTrees.findMany({
			orderBy: [asc(talentTrees.class), asc(talentTrees.index)],
			where: and(
				eq(talentTrees.createdById, turtleAccId),
				input.name ? like(talentTrees.name, `%${input.name}%`) : undefined,
				input.class ? eq(talentTrees.class, input.class) : undefined
			),
			with: { createdBy: true }
		});
	}
});

export const listProposalTalentTrees = protectedProcedure({
	input: Filters,
	queryKey: 'listProposalTalentTrees',
	query: async ({ input, db }) => {
		const proposals = await db.query.proposalTrees.findMany({
			orderBy: [asc(proposalTrees.class), asc(proposalTrees.index)],
			where: input.class ? eq(proposalTrees.class, input.class) : undefined,
			with: { tree: { with: { createdBy: true } } }
		});
		return proposals.map(p => p.tree);
	}
});

export const listPublicTalentTrees = protectedProcedure({
	input: Filters,
	queryKey: 'listPublicTalentTrees',
	query: async ({ input, db }) => {
		const turtleAccId = await turtleWoWAccountId(undefined);

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
				not(eq(talentTrees.createdById, turtleAccId)),
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
	input: z.string().optional(),
	queryKey: 'getTalentTree',
	query: async ({ db, input, session }) => {
		if (!input) return undefined;

		const tree = await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input),
			with: { createdBy: true }
		});

		const turtleAccId = await turtleWoWAccountId(undefined);
		if (tree?.createdById !== turtleAccId && !session) return undefined;

		return tree;
	},
	sessionType: 'any'
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

export const promoteTalentTree = adminProcedure({
	input: z.string(),
	query: async ({ input, db }) => {
		const entry = await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input)
		});

		if (!entry) throw new Error('NOT_FOUND');

		if (!entry.class) throw new Error('Class not selected');

		const inGame = await db.query.proposalTrees.findFirst({
			where: and(
				eq(proposalTrees.index, entry.index),
				eq(proposalTrees.class, entry.class)
			)
		});

		if (!inGame) {
			await db.insert(proposalTrees).values({
				class: entry.class,
				index: entry.index,
				treeId: entry.id
			});
		} else {
			await db
				.update(proposalTrees)
				.set({ treeId: entry.id })
				.where(
					and(
						eq(proposalTrees.index, entry.index),
						eq(proposalTrees.class, entry.class)
					)
				);
		}
		revalidateTag(getQueryTag('listProposalTalentTrees'));
	}
});
