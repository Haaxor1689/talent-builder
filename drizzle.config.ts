import { defineConfig } from 'drizzle-kit';

import { env } from '~/env';

export default defineConfig({
	schema: './src/server/db/schema.ts',
	out: './migrations',
	driver: 'turso',
	dialect: 'sqlite',
	dbCredentials: {
		url: env.DATABASE_URL,
		authToken: env.DATABASE_AUTH_TOKEN
	},
	tablesFilter: ['talent-builder_*'],
	verbose: true,
	strict: true
});
