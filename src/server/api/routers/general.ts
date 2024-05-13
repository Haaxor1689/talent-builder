'use server';

import { writeFile, readFile } from 'node:fs/promises';

import { eq } from 'drizzle-orm';
import { stringify, parse } from 'superjson';
import { nanoid } from 'nanoid';
import { type SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';
import { z } from 'zod';

import {
	accounts,
	icons,
	savedBuilds,
	sessions,
	talentTrees,
	users,
	verificationTokens
} from '~/server/db/schema';
import { type db } from '~/server/db';

import { publicProcedure, adminProcedure } from '../helpers';

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
	users: ['./migrations_users.json', users],
	accounts: ['./migrations_accounts.json', accounts],
	sessions: ['./migrations_sessions.json', sessions],
	verificationTokens: [
		'./migrations_verificationTokens.json',
		verificationTokens
	],
	icons: ['./migrations_icons.json', icons],
	talentTrees: ['./migrations_talentTrees.json', talentTrees],
	savedBuilds: ['./migrations_savedBuilds.json', savedBuilds]
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
		if (!TABLES[input]) return;
		const [path, table] = TABLES[input];
		await writeFile(path, stringify(await selectAll(db, table)));
	}
});

export const importTable = adminProcedure({
	input: z.enum(
		Object.keys(TABLES) as [keyof typeof TABLES, ...(keyof typeof TABLES)[]]
	),
	query: async ({ input, db }) => {
		if (!TABLES[input]) return;
		const [path, table] = TABLES[input];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const values = parse<any[]>(await readFile(path, { encoding: 'utf-8' }));
		if (!values.length) return;
		await db.delete(table);
		await db.insert(table).values(values);
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

export const getSession = publicProcedure({
	query: async ({ session }) => session
});
