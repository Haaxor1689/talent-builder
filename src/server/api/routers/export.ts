import { writeFile, readFile } from 'node:fs/promises';

import { stringify, parse } from 'superjson';

import {
	accounts,
	icons,
	sessions,
	talentTrees,
	users,
	verificationTokens
} from '~/server/db/schema';

import { adminProcedure } from '../helpers';

const TABLES = [
	['./migrations/users.json', users],
	['./migrations/accounts.json', accounts],
	['./migrations/sessions.json', sessions],
	['./migrations/verificationTokens.json', verificationTokens],
	['./migrations/icons.json', icons],
	['./migrations/talentTrees.json', talentTrees]
] as const;

export const exportAll = adminProcedure({
	query: async ({ db }) => {
		for (const [path, table] of TABLES) {
			await writeFile(path, stringify(await db.select().from(table)));
		}
	}
});

export const importAll = adminProcedure({
	query: async ({ db }) => {
		for (const [path, table] of TABLES) {
			const values = parse<[]>(await readFile(path, { encoding: 'utf-8' }));
			if (!values.length) continue;
			await db
				.insert(table)
				.values(values)
				.catch(e => console.error(e));
		}
	}
});
