import { relations } from 'drizzle-orm';
import {
	index,
	integer,
	primaryKey,
	sqliteTableCreator,
	text
} from 'drizzle-orm/sqlite-core';
import { type AdapterAccount } from 'next-auth/adapters';
import { nanoid } from 'nanoid';

import { type TalentTreeT } from '~/server/api/types';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const sqliteTable = sqliteTableCreator(name => `talent-builder_${name}`);

export const users = sqliteTable('user', {
	id: text('id', { length: 36 }).notNull().primaryKey(),
	name: text('name', { length: 255 }),
	email: text('email', { length: 255 }).notNull(),
	emailVerified: integer('emailVerified', { mode: 'timestamp' }),
	image: text('image', { length: 255 }),
	isAdmin: integer('isAdmin', { mode: 'boolean' }).default(0 as never)
});

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	trees: many(talentTrees)
}));

export const accounts = sqliteTable(
	'account',
	{
		userId: text('userId', { length: 255 }).notNull(),
		type: text('type', { length: 255 })
			.$type<AdapterAccount['type']>()
			.notNull(),
		provider: text('provider', { length: 255 }).notNull(),
		providerAccountId: text('providerAccountId', { length: 255 }).notNull(),
		refresh_token: text('refresh_token'),
		access_token: text('access_token'),
		expires_at: integer('expires_at'),
		token_type: text('token_type', { length: 255 }),
		scope: text('scope', { length: 255 }),
		id_token: text('id_token'),
		session_state: text('session_state', { length: 255 })
	},
	account => ({
		compoundKey: primaryKey({
			columns: [account.provider, account.providerAccountId]
		}),
		userIdIdx: index('account_userId_idx').on(account.userId)
	})
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] })
}));

export const sessions = sqliteTable(
	'session',
	{
		sessionToken: text('sessionToken', { length: 255 }).notNull().primaryKey(),
		userId: text('userId', { length: 255 }).notNull(),
		expires: integer('expires', { mode: 'timestamp' }).notNull()
	},
	session => ({
		userIdIdx: index('session_userId_idx').on(session.userId)
	})
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] })
}));

export const verificationTokens = sqliteTable(
	'verificationToken',
	{
		identifier: text('identifier', { length: 255 }).notNull(),
		token: text('token', { length: 255 }).notNull(),
		expires: integer('expires', { mode: 'timestamp' }).notNull()
	},
	vt => ({
		compoundKey: primaryKey({ columns: [vt.identifier, vt.token] })
	})
);

export const icons = sqliteTable('icon', {
	name: text('name', { length: 255 }).notNull().primaryKey(),
	data: text('data').notNull()
});

export const iconsRelations = relations(icons, ({ many }) => ({
	trees: many(talentTrees)
}));

export const talentTrees = sqliteTable(
	'talentTree',
	{
		id: text('id', { length: 36 })
			.primaryKey()
			.$default(() => nanoid(10)),
		name: text('name', { length: 255 }).notNull(),
		public: integer('public', { mode: 'boolean' })
			.default(0 as never)
			.notNull(),
		notes: text('notes'),
		class: integer('class').notNull().default(0),
		icon: text('icon', { length: 255 })
			.default('inv_misc_questionmark')
			.notNull(),
		tree: text('tree', { mode: 'json' })
			.default('[]')
			.$type<TalentTreeT>()
			.notNull(),
		createdById: text('createdById', { length: 255 }).notNull(),
		createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updatedAt', { mode: 'timestamp' })
	},
	example => ({
		createdByIdIdx: index('trees_createdById_idx').on(example.createdById),
		nameIndex: index('trees_name_idx').on(example.name),
		publicIndex: index('trees_public_idx').on(example.public)
	})
);

export const treesRelations = relations(talentTrees, ({ one }) => ({
	createdBy: one(users, {
		fields: [talentTrees.createdById],
		references: [users.id]
	}),
	iconSource: one(icons, {
		fields: [talentTrees.icon],
		references: [icons.name]
	})
}));

export const savedBuilds = sqliteTable(
	'savedBuild',
	{
		id: text('id', { length: 10 })
			.primaryKey()
			.$default(() => nanoid(10)),
		name: text('name', { length: 255 }).notNull(),
		class: integer('class').notNull(),
		tree0Id: text('tree0Id', { length: 36 }).notNull(),
		tree1Id: text('tree1Id', { length: 36 }).notNull(),
		tree2Id: text('tree2Id', { length: 36 }).notNull(),
		talents: text('talents', { length: 86 }).notNull(),
		createdById: text('createdById', { length: 255 }).notNull(),
		createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updatedAt', { mode: 'timestamp' })
	},
	example => ({
		createdByIdIdx: index('builds_createdById_idx').on(example.createdById)
	})
);

export const savedBuildsRelations = relations(savedBuilds, ({ one }) => ({
	createdBy: one(users, {
		fields: [savedBuilds.createdById],
		references: [users.id]
	})
}));
