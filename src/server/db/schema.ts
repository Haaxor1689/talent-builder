import { relations } from 'drizzle-orm';
import {
	index,
	integer,
	primaryKey,
	sqliteTableCreator,
	text
} from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

import { type Talents } from '#server/schemas.ts';

export const sqliteTable = sqliteTableCreator(name => `talent-builder_${name}`);

// Auth tables

export const UserRoles = ['user', 'supporter', 'admin'] as [
	'user',
	'supporter',
	'admin'
];
export type UserRole = (typeof UserRoles)[number];

export const user = sqliteTable(
	'user',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		email: text('email').notNull(),
		emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull(),
		image: text('image'),
		createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
		role: text('role', { enum: UserRoles }).default('user').notNull()
	},
	t => [index('user_name_idx').on(t.name)]
);

export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	sessions: many(session),
	trees: many(talentTrees),
	builds: many(savedBuilds),
	collections: many(collections)
}));

export const account = sqliteTable(
	'account',
	{
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
	},
	t => [index('account_userId_idx').on(t.userId)]
);

export const session = sqliteTable(
	'session',
	{
		id: text('id').primaryKey(),
		userId: text('userId').notNull(),
		token: text('token').notNull(),
		expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
		ipAddress: text('ipAddress'),
		userAgent: text('userAgent'),
		createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
	},
	t => [index('session_userId_idx').on(t.userId)]
);

export const verification = sqliteTable(
	'verification',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
		createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
	},
	t => [
		index('verification_identifier_idx').on(t.identifier),
		index('verification_identifier_expiresAt_idx').on(t.identifier, t.expiresAt)
	]
);

// Content tables

export const ItemVisibility = ['public', 'private'] as const;
export type ItemVisibilityType = (typeof ItemVisibility)[number];

export const talentTrees = sqliteTable(
	'talentTree',
	{
		id: text('id', { length: 36 })
			.primaryKey()
			.$default(() => nanoid(10)),
		name: text('name', { length: 255 }).notNull(),
		slug: text('slug', { length: 255 }).unique(),
		visibility: text('visibility', { enum: ItemVisibility })
			.default('public')
			.notNull(),
		notes: text('notes'),
		class: integer('class').default(0).notNull(),
		index: integer('index').default(0).notNull(),
		icon: text('icon', { length: 255 })
			.default('inv_misc_questionmark')
			.notNull(),
		rows: integer('rows').default(7).notNull(),
		talents: text('talents', { mode: 'json' })
			.default('{}')
			.notNull()
			.$type<Talents>(),
		collection: text('collection', { length: 255 }),
		createdById: text('createdById', { length: 255 }).notNull(),
		createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
	},
	t => [
		index('trees_createdById_idx').on(t.createdById),
		index('trees_name_idx').on(t.name),
		index('trees_visibility_idx').on(t.visibility),
		index('trees_rows_idx').on(t.rows),
		index('trees_collection_idx').on(t.collection),
		index('trees_class_idx').on(t.class),
		index('trees_collection_class_index_rows_idx').on(
			t.collection,
			t.class,
			t.index,
			t.rows
		),
		index('trees_visibility_createdById_updatedAt_idx').on(
			t.visibility,
			t.createdById,
			t.updatedAt
		),
		index('trees_createdById_updatedAt_idx').on(t.createdById, t.updatedAt)
	]
);

export const treesRelations = relations(talentTrees, ({ one, many }) => ({
	createdBy: one(user, {
		fields: [talentTrees.createdById],
		references: [user.id]
	}),
	collectionTrees: many(collectionTrees)
}));

export const collectionTrees = sqliteTable(
	'collectionTree',
	{
		collectionId: text('collectionId', { length: 11 }).notNull(),
		treeId: text('treeId', { length: 36 }).notNull()
	},
	t => [
		primaryKey({ columns: [t.collectionId, t.treeId] }),
		index('collectionTrees_collectionId_idx').on(t.collectionId),
		index('collectionTrees_treeId_idx').on(t.treeId)
	]
);

export const collections = sqliteTable(
	'collection',
	{
		id: text('id', { length: 11 })
			.primaryKey()
			.$default(() => nanoid(10)),
		name: text('name', { length: 255 }).notNull(),
		slug: text('slug', { length: 255 }).unique(),
		visibility: text('visibility', { enum: ItemVisibility })
			.default('public')
			.notNull(),
		icon: text('icon', { length: 255 })
			.default('inv_misc_questionmark')
			.notNull(),
		assignedTrees: text('assignedTrees', { mode: 'json' })
			.default('{}')
			.notNull()
			.$type<Record<string, string>>(),
		createdById: text('createdById', { length: 255 }).notNull(),
		createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
	},
	t => [
		index('collections_createdById_idx').on(t.createdById),
		index('collections_name_idx').on(t.name),
		index('collections_visibility_idx').on(t.visibility),
		index('collections_updatedAt_idx').on(t.updatedAt)
	]
);

export const collectionsRelations = relations(collections, ({ many, one }) => ({
	createdBy: one(user, {
		fields: [collections.createdById],
		references: [user.id]
	}),
	collectionTrees: many(collectionTrees)
}));

export const collectionTreesRelations = relations(
	collectionTrees,
	({ one }) => ({
		collection: one(collections, {
			fields: [collectionTrees.collectionId],
			references: [collections.id]
		}),
		tree: one(talentTrees, {
			fields: [collectionTrees.treeId],
			references: [talentTrees.id]
		})
	})
);

export const savedBuilds = sqliteTable(
	'savedBuild',
	{
		id: text('id', { length: 10 })
			.primaryKey()
			.$default(() => nanoid(10)),
		name: text('name', { length: 255 }).notNull(),
		slug: text('slug', { length: 255 }).unique(),
		class: integer('class').notNull(),
		tree0Id: text('tree0Id', { length: 36 }).notNull(),
		tree1Id: text('tree1Id', { length: 36 }).notNull(),
		tree2Id: text('tree2Id', { length: 36 }).notNull(),
		talents: text('talents', { length: 86 }).notNull(),
		createdById: text('createdById', { length: 255 }).notNull(),
		createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
		updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull()
	},
	t => [
		index('builds_createdById_idx').on(t.createdById),
		index('builds_createdById_updatedAt_idx').on(t.createdById, t.updatedAt)
	]
);

export const savedBuildsRelations = relations(savedBuilds, ({ one }) => ({
	createdBy: one(user, {
		fields: [savedBuilds.createdById],
		references: [user.id]
	})
}));
