'use server';

import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { omit } from 'lodash-es';

import { savedBuilds } from '~/server/db/schema';

import {
	getFullTag,
	getQueryTag,
	protectedProcedure,
	publicProcedure
} from '../helpers';
import { BuildForm } from '../types';

import { turtleWoWAccountId } from './general';

export const upsertSavedBuild = protectedProcedure({
	input: BuildForm.extend({
		tree0Id: z.string(),
		tree1Id: z.string(),
		tree2Id: z.string()
	}),
	query: async ({ input: { points, ...input }, db, session }) => {
		const entry = await db.query.savedBuilds.findFirst({
			where: eq(savedBuilds.id, input.id)
		});

		if (!entry) {
			await db.insert(savedBuilds).values({
				...input,
				talents: points.map(p => p.join('')).join('-'),
				createdById: session.user.id,
				createdAt: new Date()
			});
		} else {
			if (!session.user.isAdmin && session.user.id !== entry.createdById)
				throw new Error('UNAUTHORIZED');

			await db
				.update(savedBuilds)
				.set({
					...omit(input, ['createdBy', 'createdById', 'createdAt']),
					talents: points.map(p => p.join('')).join('-'),
					updatedAt: new Date()
				})
				.where(eq(savedBuilds.id, input.id));
		}

		const turtleAccId = await turtleWoWAccountId(undefined);
		if (input?.createdById === turtleAccId) {
			revalidateTag(getQueryTag('listTurtleSavedBuilds'));
		}

		revalidateTag(getFullTag('getSavedBuild', input.id));

		const build = await db.query.savedBuilds.findFirst({
			where: eq(savedBuilds.id, input.id)
		});
		return {
			...build,
			points: build?.talents
				.split('-')
				.map(p => [...p].map(v => Number(v))) as [number[], number[], number[]]
		};
	}
});

export const listTurtleSavedBuilds = publicProcedure({
	queryKey: 'listTurtleSavedBuilds',
	query: async ({ db }) => {
		const turtleAccId = await turtleWoWAccountId(undefined);
		return db.query.savedBuilds.findMany({
			orderBy: [asc(savedBuilds.class)],
			where: eq(savedBuilds.createdById, turtleAccId),
			with: { createdBy: true }
		});
	}
});

export const listPersonalSavedBuilds = protectedProcedure({
	query: async ({ db, session }) =>
		db.query.savedBuilds.findMany({
			orderBy: [asc(savedBuilds.class)],
			where: eq(savedBuilds.createdById, session.user.id),
			with: { createdBy: true }
		})
});

export const getSavedBuild = publicProcedure({
	input: z.string(),
	queryKey: 'getSavedBuild',
	query: async ({ db, input, session }) => {
		const build = await db.query.savedBuilds.findFirst({
			where: eq(savedBuilds.id, input),
			with: { createdBy: true }
		});

		const turtleAccId = await turtleWoWAccountId(undefined);
		if (!build || (build?.createdById !== turtleAccId && !session))
			return undefined;

		return {
			...build,
			points: build.talents.split('-').map(p => [...p].map(v => Number(v))) as [
				number[],
				number[],
				number[]
			]
		};
	},
	sessionType: 'any'
});

export const deleteSavedBuild = protectedProcedure({
	input: z.string(),
	query: async ({ input, db, session }) => {
		const entry = await db.query.savedBuilds.findFirst({
			where: eq(savedBuilds.id, input)
		});

		if (!entry) throw new Error('NOT_FOUND');

		if (!session.user.isAdmin && session.user.id !== entry?.createdById)
			throw new Error('UNAUTHORIZED');

		await db.delete(savedBuilds).where(eq(savedBuilds.id, input));

		const turtleAccId = await turtleWoWAccountId(undefined);
		if (entry.createdById === turtleAccId) {
			revalidateTag(getQueryTag('listTurtleSavedBuilds'));
		}

		revalidateTag(getFullTag('getSavedBuild', entry.id));
	}
});
