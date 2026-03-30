'use server';

import { and, desc, eq, inArray, like, not, or } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import { z } from 'zod';

import { GameVersions } from '#components/styled/GameVersion.tsx';
import { db } from '#server/db/index.ts';
import { talentTrees, user as userTable } from '#server/db/schema.ts';
import { serverFunction } from '#server/helpers.ts';
import { TalentForm, TreesFilters } from '#server/schemas.ts';
import { canEdit } from '#utils/auth.ts';
import { Errors } from '#utils/errors.ts';

import { createdBySelect, getUser, uniqueSlugException } from '.';

const getVersionFilter = (rows?: number) => {
	if (rows === undefined) return undefined;
	if (rows > 0) return eq(talentTrees.rows, rows);
	// -1 represents "custom" version that is everything except known versions
	return not(
		inArray(
			talentTrees.rows,
			GameVersions.map(v => v.rows)
		)
	);
};

export const listInfiniteTalentTrees = serverFunction({
	input: TreesFilters.extend({
		limit: z.number().min(1).max(100).optional(),
		cursor: z.number().optional()
	}),
	session: () => getUser().then(u => ({ id: u?.id, role: u?.role })),
	query: async (input, user) => {
		const { limit = 32, cursor: offset = 0 } = input;

		const whereAcc = input.from
			? (
					await db.query.user.findMany({
						where: like(userTable.name, `%${input.from}%`),
						columns: { id: true }
					})
				).map(a => a.id)
			: [];

		if (input.from && !whereAcc.length)
			return { items: [], nextCursor: undefined };

		const items = await db.query.talentTrees.findMany({
			limit: limit + 1,
			offset,
			orderBy: [desc(talentTrees.updatedAt)],
			where: and(
				user.role === 'admin'
					? undefined
					: or(
							eq(talentTrees.visibility, 'public'),
							user.id ? eq(talentTrees.createdById, user.id) : undefined
						),
				input.name ? like(talentTrees.name, `%${input.name}%`) : undefined,
				whereAcc.length
					? inArray(talentTrees.createdById, whereAcc)
					: undefined,
				input.class ? eq(talentTrees.class, input.class) : undefined,
				getVersionFilter(input.rows)
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

const updateTags = (id: string, userId: string) => {
	updateTag(`talentTrees:id:${id}`);
	updateTag(`users:id:${userId}`);
};

export const upsertTalentTree = serverFunction({
	input: TalentForm,
	session: () => getUser('user').then(u => ({ id: u?.id, role: u?.role })),
	query: async (input, user) => {
		const current = await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input.id)
		});

		const now = new Date();
		if (!current) {
			await db
				.insert(talentTrees)
				.values({
					...input,
					visibility: input.visibility ?? 'public',
					createdById: user.id,
					createdAt: now,
					updatedAt: now
				})
				.catch(uniqueSlugException);
		} else {
			if (!canEdit(user, current))
				throw Errors.unauthorized({
					message: 'You do not have permission to edit this tree'
				});

			await db
				.update(talentTrees)
				.set({
					...input,
					visibility: input.visibility ?? current.visibility,
					createdById: current.createdById,
					createdAt: current.createdAt,
					updatedAt: now
				})
				.where(eq(talentTrees.id, input.id))
				.catch(uniqueSlugException);
		}

		updateTags(input.id, current?.createdById ?? user.id);
	}
});

export const deleteTalentTree = serverFunction({
	input: z.object({ id: z.string() }),
	session: () => getUser('user').then(u => ({ id: u?.id, role: u?.role })),
	query: async (input, user) => {
		const current = await db.query.talentTrees.findFirst({
			where: eq(talentTrees.id, input.id)
		});

		if (!canEdit(user, current))
			throw Errors.unauthorized({
				message: 'You do not have permission to delete this tree'
			});

		await db.delete(talentTrees).where(eq(talentTrees.id, input.id));

		updateTags(input.id, current?.createdById ?? user.id);
	}
});
