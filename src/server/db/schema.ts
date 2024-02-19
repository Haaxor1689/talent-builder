import { relations, sql } from 'drizzle-orm';
import {
	index,
	int,
	mysqlTableCreator,
	primaryKey,
	text,
	timestamp,
	varchar,
	json,
	boolean
} from 'drizzle-orm/mysql-core';
import { type AdapterAccount } from 'next-auth/adapters';
import { v4 } from 'uuid';

import { type TalentTreeT } from '~/server/api/types';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator(name => `talent-builder_${name}`);

export const users = mysqlTable('user', {
	id: varchar('id', { length: 255 }).notNull().primaryKey(),
	name: varchar('name', { length: 255 }),
	email: varchar('email', { length: 255 }).notNull(),
	emailVerified: timestamp('emailVerified', {
		mode: 'date',
		fsp: 3
	}).default(sql`CURRENT_TIMESTAMP(3)`),
	image: varchar('image', { length: 255 })
});

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	trees: many(talentTrees)
}));

export const accounts = mysqlTable(
	'account',
	{
		userId: varchar('userId', { length: 255 }).notNull(),
		type: varchar('type', { length: 255 })
			.$type<AdapterAccount['type']>()
			.notNull(),
		provider: varchar('provider', { length: 255 }).notNull(),
		providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
		refresh_token: text('refresh_token'),
		access_token: text('access_token'),
		expires_at: int('expires_at'),
		token_type: varchar('token_type', { length: 255 }),
		scope: varchar('scope', { length: 255 }),
		id_token: text('id_token'),
		session_state: varchar('session_state', { length: 255 })
	},
	account => ({
		compoundKey: primaryKey({
			columns: [account.provider, account.providerAccountId]
		}),
		userIdIdx: index('userId_idx').on(account.userId)
	})
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, { fields: [accounts.userId], references: [users.id] })
}));

export const sessions = mysqlTable(
	'session',
	{
		sessionToken: varchar('sessionToken', { length: 255 })
			.notNull()
			.primaryKey(),
		userId: varchar('userId', { length: 255 }).notNull(),
		expires: timestamp('expires', { mode: 'date' }).notNull()
	},
	session => ({
		userIdIdx: index('userId_idx').on(session.userId)
	})
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, { fields: [sessions.userId], references: [users.id] })
}));

export const verificationTokens = mysqlTable(
	'verificationToken',
	{
		identifier: varchar('identifier', { length: 255 }).notNull(),
		token: varchar('token', { length: 255 }).notNull(),
		expires: timestamp('expires', { mode: 'date' }).notNull()
	},
	vt => ({
		compoundKey: primaryKey({ columns: [vt.identifier, vt.token] })
	})
);

export const icons = mysqlTable('icon', {
	name: varchar('name', { length: 255 }).notNull().primaryKey(),
	data: text('data').notNull()
});

export const iconsRelations = relations(icons, ({ many }) => ({
	trees: many(talentTrees)
}));

export const talentTrees = mysqlTable(
	'talentTree',
	{
		id: varchar('id', { length: 128 }).primaryKey().$default(v4),
		name: varchar('name', { length: 256 }).default('New talent tree').notNull(),
		public: boolean('public').default(false).notNull(),
		class: int('class').notNull().default(0),
		icon: varchar('icon', { length: 256 })
			.default('inv_misc_questionmark')
			.notNull(),
		tree: json('tree').$type<TalentTreeT>().notNull().default([]),
		createdById: varchar('createdById', { length: 255 }).notNull(),
		createdAt: timestamp('created_at')
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp('updatedAt').onUpdateNow()
	},
	example => ({
		createdByIdIdx: index('createdById_idx').on(example.createdById),
		nameIndex: index('name_idx').on(example.name),
		publicIndex: index('public_idx').on(example.public)
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
