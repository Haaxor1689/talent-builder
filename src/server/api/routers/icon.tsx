'use server';

import { desc, eq, like } from 'drizzle-orm';
import { z } from 'zod';
import { revalidatePath, revalidateTag } from 'next/cache';
import { ImageResponse } from 'next/og';

import { icons, talentTrees } from '~/server/db/schema';
import { env } from '~/env';

import { adminProcedure, getFullTag, publicProcedure } from '../helpers';

export const upsertIcon = adminProcedure({
	input: z.object({ name: z.string(), data: z.string() }),
	query: async ({ input, db }) => {
		const entry = await db.query.icons.findFirst({
			where: eq(icons.name, input.name)
		});

		if (!entry) await db.insert(icons).values(input);
		else await db.update(icons).set(input).where(eq(icons.name, input.name));

		revalidateTag(getFullTag('getIcon', input.name));
		revalidateTag(getFullTag('getIconData', input.name));
		revalidatePath(`/api/icon/${input.name}`);

		const trees = await db.query.talentTrees.findMany({
			where: eq(talentTrees.icon, input.name)
		});
		trees.forEach(tree => {
			revalidateTag(getFullTag('getOgInfo', tree.id));
			revalidatePath(`/api/og/${tree.id}`);
		});
	}
});

export const listIcons = publicProcedure({
	input: z.object({
		limit: z.number().min(1).max(100).optional(),
		cursor: z.number().optional(),
		filter: z.string().optional()
	}),
	queryKey: 'listIcons',
	query: async ({ input, db }) => {
		const { limit = 32, cursor: offset = 0 } = input;
		const items = await db.query.icons.findMany({
			limit: limit + 1,
			offset,
			where: input.filter ? like(icons.name, `%${input.filter}%`) : undefined,
			orderBy: [desc(icons.name)]
		});
		const hasMore = items.length > limit;
		if (hasMore) items.pop();
		return {
			items,
			nextCursor: hasMore ? offset + items.length : undefined
		};
	}
});

export const getIcon = publicProcedure({
	input: z.string(),
	queryKey: 'getIcon',
	query: async ({ db, input }) =>
		db.query.icons.findFirst({
			where: eq(icons.name, input)
		})
});

export const deleteIcon = adminProcedure({
	input: z.string(),
	query: async ({ input, db }) => {
		await db.delete(icons).where(eq(icons.name, input));

		revalidateTag(getFullTag('getIcon', input));
		revalidateTag(getFullTag('getIconData', input));
		revalidatePath(`/api/icon/${input}`);
	}
});

export const getIconData = publicProcedure({
	input: z.string(),
	queryKey: 'getIconData',
	query: async ({ db, input }) => {
		const icon = await db.query.icons.findFirst({
			where: eq(icons.name, input)
		});
		if (icon) return icon.data;

		// Fetch from wowhead
		const wowHeadIcon = await fetch(
			`https://wow.zamimg.com/images/wow/icons/large/${input}.jpg`
		);

		const size = { width: 64, height: 64 };
		const img = new ImageResponse(
			(
				<div
					style={{
						position: 'relative',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						...size
					}}
				>
					{wowHeadIcon.ok ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={`https://wow.zamimg.com/images/wow/icons/large/${input}.jpg`}
							alt={input}
							{...size}
							style={{ padding: 4 }}
						/>
					) : (
						<div
							style={{
								textAlign: 'center',
								color: 'red',
								fontSize: 10,
								wordBreak: 'break-all',
								padding: 6
							}}
						>
							{input}
						</div>
					)}
					<div
						style={{
							position: 'absolute',
							bottom: 2,
							right: 2,
							width: '100%',
							height: '100%',
							backgroundImage: `url("${env.DEPLOY_URL}/icon_frame.png")`
						}}
					/>
				</div>
			),
			size
		);
		return Buffer.from(await img.arrayBuffer()).toString('base64');
	}
});
