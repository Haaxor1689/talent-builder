'use server';

import { asc, eq } from 'drizzle-orm';
import { stringify } from 'superjson';
import { nanoid } from 'nanoid';
import { type SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';

import {
	accounts,
	savedBuilds,
	sessions,
	talentTrees,
	users,
	verificationTokens
} from '~/server/db/schema';
import { type db } from '~/server/db';
import { env } from '~/env';

import { publicProcedure, adminProcedure } from '../helpers';
import { Talent, TalentForm } from '../types';

import { listTurtleTalentTrees } from './talentTree';

export const createTurtleWoWAccount = adminProcedure({
	query: async ({ db }) => {
		const exists = await db.query.users.findFirst({
			where: eq(users.name, 'TurtleWoW')
		});
		if (exists) return;
		await db.insert(users).values({
			id: nanoid(10),
			email: 'betkomaros@gmail.com',
			name: 'TurtleWoW',
			image: 'https://talent-builder.haaxor1689.dev/turtle.png',
			isAdmin: true
		});
	}
});

export const turtleWoWAccountId = publicProcedure({
	queryKey: 'turtleWoWAccountId',
	query: async ({ db }) => {
		const turtleAcc = await db.query.users.findFirst({
			where: eq(users.name, 'TurtleWoW')
		});
		return turtleAcc?.id ?? '';
	}
});

const TABLES = {
	users,
	accounts,
	sessions,
	verificationTokens,
	talentTrees,
	savedBuilds
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectAll = async <T extends SQLiteTableWithColumns<any>>(
	dbb: typeof db,
	table: T
) => {
	const result: T['$inferSelect'][] = [];
	let page;
	do {
		page = await dbb.select().from(table).limit(50).offset(result.length);
		result.push(...page);
	} while (page.length === 50);
	return result;
};

export const exportTable = adminProcedure({
	input: z.enum(
		Object.keys(TABLES) as [keyof typeof TABLES, ...(keyof typeof TABLES)[]]
	),
	query: async ({ input, db }) => {
		if (!TABLES[input]) throw new Error('Invalid table');
		return stringify(await selectAll(db, TABLES[input]));
	}
});

export const importTable = adminProcedure({
	input: z.object({
		data: z.string(),
		table: z.enum(
			Object.keys(TABLES) as [keyof typeof TABLES, ...(keyof typeof TABLES)[]]
		)
	}),
	query: async ({ input, db }) => {
		if (!TABLES[input.table] || !input.data) return;
		const table = TABLES[input.table];
		const values = JSON.parse(input.data) as (typeof table)['$inferSelect'][];
		if (!values?.length) throw new Error('Invalid data');
		await db.delete(table);
		await db.insert(table).values(
			values.map(v => ({
				...v,
				createdAt: 'createdAt' in v ? new Date(v.createdAt) : undefined,
				updatedAt:
					'updatedAt' in v && v.updatedAt ? new Date(v.updatedAt) : undefined
			}))
		);
	}
});

export const regenerateIds = adminProcedure({
	query: async ({ db }) => {
		const values = await selectAll(db, talentTrees);
		await db.delete(talentTrees);
		await db
			.insert(talentTrees)
			.values(values.map(v => ({ ...v, id: nanoid(10) })));
	}
});

export const exportMissingIcons = adminProcedure({
	query: async ({ db }) => {
		const list: [number, string][] = await fetch(
			`${env.DEPLOY_URL}/icons/list.json`
		).then(r => r.json());

		const trees = await db.query.proposalTrees.findMany({
			with: { tree: true }
		});
		const icons = new Set<string>();
		trees
			.flatMap(t => t.tree.talents)
			.filter(t => t.icon)
			.forEach(t => {
				const item = list.find(i => i[1] === t.icon);
				if (!item || item[0] === -1) icons.add(t.icon);
			});
		return [...icons].join(',');
	}
});

export const importClientTrees = adminProcedure({
	input: z.string(),
	query: async ({ input, db }) => {
		const trees = z.array(TalentForm).safeParse(JSON.parse(input));
		if (!trees.success) {
			throw new Error(
				`Invalid input: ${JSON.stringify(trees.error.errors, null, 2)}`
			);
		}
		const turtleWoW = await turtleWoWAccountId(undefined);
		await db.delete(talentTrees).where(eq(talentTrees.createdById, turtleWoW));
		await db.insert(talentTrees).values(
			trees.data.map(tree => ({
				...tree,
				id: nanoid(10),
				talents: tree.talents.map(t => (!t ? Talent.parse({}) : t)),
				createdById: turtleWoW,
				createdAt: new Date()
			}))
		);
	}
});

export const exportClientTrees = adminProcedure({
	query: async ({ db }) => {
		const trees = await db.query.proposalTrees.findMany({
			with: { tree: true },
			orderBy: [asc(talentTrees.class), asc(talentTrees.index)]
		});
		const turtle = await listTurtleTalentTrees({
			name: '',
			class: 0,
			from: ''
		});
		return JSON.stringify(
			trees.map((t, i) => {
				console.log({ turtle: turtle[i]?.name, tree: t.tree.name });
				return [0, 1, 2, 9, 10, 11, 20, 21, 22, 23].includes(i)
					? turtle[i]
					: t.tree;
			})
		);
	}
});
