import { relations } from 'drizzle-orm';
import {
	index,
	integer,
	sqliteTableCreator,
	text
} from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

import { type TalentTreeT } from '#server/schemas.ts';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const sqliteTable = sqliteTableCreator(name => `talent-builder_${name}`);

// Auth tables

export const user = sqliteTable('user_new', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull(),
	emailVerified: integer('emailVerified', { mode: 'boolean' }),
	image: text('image'),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
	role: text('role', { enum: ['user', 'supporter', 'admin'] })
		.default('user')
		.notNull()
});

export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	sessions: many(session),
	trees: many(talentTrees)
}));

export const account = sqliteTable('account_new', {
	id: text('id').primaryKey(),
	userId: text('userId').notNull(),
	accountId: text('accountId').notNull(),
	providerId: text('providerId').notNull(),
	providerAccountId: text('providerAccountId'),
	accessToken: text('accessToken'),
	refreshToken: text('refreshToken'),
	accessTokenExpiresAt: integer('accessTokenExpiresAt', {
		mode: 'timestamp'
	}),
	refreshTokenExpiresAt: integer('refreshTokenExpiresAt', {
		mode: 'timestamp'
	}),
	scope: text('scope'),
	idToken: text('idToken'),
	password: text('password'),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
});

export const session = sqliteTable('session_new', {
	id: text('id').primaryKey(),
	userId: text('userId').notNull(),
	token: text('token').notNull(),
	expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable('verification_new', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
	createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
});

// Content tables

export const talentTrees = sqliteTable(
	'talentTree',
	{
		id: text('id', { length: 36 })
			.primaryKey()
			.$default(() => nanoid(10)),
		name: text('name', { length: 255 }).notNull(),
		public: integer('public', { mode: 'boolean' }).default(false).notNull(),
		notes: text('notes'),
		class: integer('class').default(0).notNull(),
		index: integer('index').default(0).notNull(),
		icon: text('icon', { length: 255 })
			.default('inv_misc_questionmark')
			.notNull(),
		talents: text('talents', { mode: 'json' })
			.default('[]')
			.notNull()
			.$type<TalentTreeT>(),
		collection: text('collection', { length: 255 }),
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
	createdBy: one(user, {
		fields: [talentTrees.createdById],
		references: [user.id]
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
	createdBy: one(user, {
		fields: [savedBuilds.createdById],
		references: [user.id]
	})
}));
