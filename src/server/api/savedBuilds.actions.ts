'use server';

import { updateTag } from 'next/cache';
import { eq } from 'drizzle-orm';
import { omit } from 'es-toolkit';
import { z } from 'zod';

import { bitPack } from '#components/calculator/utils.ts';
import { db } from '#server/db/index.ts';
import { savedBuilds } from '#server/db/schema.ts';
import { serverFunction } from '#server/helpers.ts';
import { BuildForm } from '#server/schemas.ts';
import { Errors } from '#utils/errors.ts';

import { createdBySelect, getUser } from './index';

export const upsertSavedBuild = serverFunction({
	input: BuildForm.extend({
		tree0Id: z.string(),
		tree1Id: z.string(),
		tree2Id: z.string()
	}),
	session: () => getUser('user').then(u => ({ id: u.id, role: u.role })),
	query: async (input, user) => {
		const { points, ...restInput } = input;

		const entry = await db.query.savedBuilds.findFirst({
			where: eq(savedBuilds.id, restInput.id)
		});

		if (!entry) {
			await db.insert(savedBuilds).values({
				...restInput,
				talents: bitPack(points),
				createdById: user.id,
				createdAt: new Date(),
				updatedAt: new Date()
			});
		} else {
			if (user.role !== 'admin' && user.id !== entry.createdById)
				throw Errors.unauthorized({
					message: 'You do not have permission to edit this build'
				});

			await db
				.update(savedBuilds)
				.set({
					...omit(restInput, ['createdBy', 'createdById', 'createdAt']),
					talents: bitPack(points),
					updatedAt: new Date()
				})
				.where(eq(savedBuilds.id, restInput.id));
		}

		const build = await db.query.savedBuilds.findFirst({
			where: eq(savedBuilds.id, restInput.id),
			with: { createdBy: createdBySelect }
		});

		updateTag(`savedBuilds:id:${restInput.id}`);
		updateTag(`users:id:${entry?.createdById ?? user.id}`);

		return {
			...build,
			points: build?.talents
				.split('-')
				.map(p => [...p].map(v => Number(v))) as [number[], number[], number[]]
		};
	}
});

export const deleteSavedBuild = serverFunction({
	input: z.object({ id: z.string() }),
	session: () => getUser('user').then(u => ({ id: u.id, role: u.role })),
	query: async (input, user) => {
		const entry = await db.query.savedBuilds.findFirst({
			where: eq(savedBuilds.id, input.id)
		});

		if (user.role !== 'admin' && user.id !== entry?.createdById)
			throw Errors.unauthorized({
				message: 'You do not have permission to delete this build'
			});

		updateTag(`savedBuilds:id:${input.id}`);
		updateTag(`users:id:${entry?.createdById ?? user.id}`);

		await db.delete(savedBuilds).where(eq(savedBuilds.id, input.id));
	}
});
