'use server';

import { updateTag } from 'next/cache';
import { and, asc, desc, eq, inArray, like, or } from 'drizzle-orm';
import { omit } from 'es-toolkit';
import { z } from 'zod';

import { db } from '#server/db/index.ts';
import { talentTrees, user as userDb } from '#server/db/schema.ts';
import { serverFunction } from '#server/helpers.ts';
import { Filters, TalentForm } from '#server/schemas.ts';
import { Errors } from '#utils/errors.ts';

import { createdBySelect, getUser } from '.';

export const listInfiniteTalentTrees = serverFunction({
	input: Filters.extend({
		limit: z.number().min(1).max(100).optional(),
		cursor: z.number().optional()
	}),
	session: () => getUser().then(u => ({ id: u?.id, role: u?.role })),
	query: async (input, user) => {
		const { limit = 32, cursor: offset = 0 } = input;

		const whereAcc = input.from
			? (
					await db.query.user.findMany({
						where: like(userDb.name, `%${input.from}%`),
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
				user?.role !== 'admin'
					? or(
							eq(talentTrees.public, true),
							user?.id ? eq(talentTrees.createdById, user.id) : undefined
						)
					: undefined,
				input.name ? like(talentTrees.name, `%${input.name}%`) : undefined,
				user?.id && input.onlyPersonal
					? eq(talentTrees.createdById, user.id)
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

export const upsertTalentTree = serverFunction({
	input: TalentForm,
	session: () => getUser('user').then(u => ({ id: u?.id, role: u?.role })),
	query: async (input, user) => {
		const entry = await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input.id)
		});

		if (!entry) {
			await db.insert(talentTrees).values({
				...input,
				createdById: user.id,
				createdAt: new Date()
			});
		} else {
			if (user.role !== 'admin' && user.id !== entry.createdById)
				throw Errors.unauthorized({
					message: 'You do not have permission to edit this tree'
				});

			await db
				.update(talentTrees)
				.set({
					...omit(input, ['createdBy', 'createdById', 'createdAt']),
					updatedAt: new Date()
				})
				.where(eq(talentTrees.id, input.id));
		}

		updateTag(`talentTrees:id:${input.id}`);

		return await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input.id),
			with: { createdBy: createdBySelect }
		});
	}
});

export const deleteTalentTree = serverFunction({
	input: z.object({ id: z.string() }),
	session: () => getUser('user').then(u => ({ id: u?.id, role: u?.role })),
	query: async (input, user) => {
		const entry = await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input.id)
		});

		if (user.role !== 'admin' && user.id !== entry?.createdById)
			throw Errors.unauthorized({
				message: 'You do not have permission to delete this tree'
			});

		updateTag(`talentTrees:id:${input.id}`);

		await db.delete(talentTrees).where(eq(talentTrees.id, input.id));
	}
});
