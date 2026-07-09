import { type MetadataRoute } from 'next';

import { env } from '#env.js';
import { db } from '#server/db/index.ts';
import {
	isRichCollectionContent,
	isRichTreeContent
} from '#utils/isRichContent.ts';

const staticRoutes = [
	'/',
	'/trees',
	'/trees/new',
	'/trees/local',
	'/collections',
	'/calculator',
	'/changelog'
] as const;

const sitemap = async () => {
	const baseUrl = new URL(env.DEPLOY_URL);

	const [trees, collections, builds] = await Promise.all([
		db.query.talentTrees.findMany({
			where: { visibility: 'public' },
			columns: {
				id: true,
				slug: true,
				updatedAt: true,
				createdById: true,
				notes: true,
				talents: true
			},
			orderBy: { updatedAt: 'desc' }
		}),
		db.query.collections.findMany({
			where: { visibility: 'public' },
			columns: {
				id: true,
				slug: true,
				updatedAt: true,
				createdById: true,
				assignedTrees: true
			},
			orderBy: { updatedAt: 'desc' }
		}),
		db.query.savedBuilds.findMany({
			columns: {
				id: true,
				slug: true,
				updatedAt: true,
				createdById: true
			},
			orderBy: { updatedAt: 'desc' }
		})
	]);

	const richTrees = trees.filter(tree =>
		isRichTreeContent({ notes: tree.notes, talents: tree.talents })
	);

	const richCollections = collections.filter(collection =>
		isRichCollectionContent(collection)
	);

	const creatorStats = new Map<
		string,
		{ treesCount: number; collectionsCount: number; calculatorsCount: number }
	>();

	for (const tree of richTrees) {
		const current = creatorStats.get(tree.createdById) ?? {
			treesCount: 0,
			collectionsCount: 0,
			calculatorsCount: 0
		};
		current.treesCount += 1;
		creatorStats.set(tree.createdById, current);
	}

	for (const collection of richCollections) {
		const current = creatorStats.get(collection.createdById) ?? {
			treesCount: 0,
			collectionsCount: 0,
			calculatorsCount: 0
		};
		current.collectionsCount += 1;
		creatorStats.set(collection.createdById, current);
	}

	for (const build of builds) {
		const current = creatorStats.get(build.createdById) ?? {
			treesCount: 0,
			collectionsCount: 0,
			calculatorsCount: 0
		};
		current.calculatorsCount += 1;
		creatorStats.set(build.createdById, current);
	}

	const richProfileIds = [...creatorStats.entries()]
		.filter(
			([, counts]) =>
				counts.treesCount + counts.collectionsCount + counts.calculatorsCount >=
				9
		)
		.map(([profileId]) => profileId);

	const entries: MetadataRoute.Sitemap = [
		...staticRoutes.map(route => ({
			url: new URL(route, baseUrl).toString(),
			lastModified: new Date(),
			changeFrequency: 'daily' as const,
			priority: route === '/' ? 1 : 0.8
		})),
		...richTrees.map(tree => ({
			url: new URL(`/trees/${tree.slug ?? tree.id}`, baseUrl).toString(),
			lastModified: tree.updatedAt,
			changeFrequency: 'weekly' as const,
			priority: 0.9
		})),
		...builds.map(build => ({
			url: new URL(`/calculator/${build.slug ?? build.id}`, baseUrl).toString(),
			lastModified: build.updatedAt,
			changeFrequency: 'weekly' as const,
			priority: 0.7
		})),
		...richCollections.map(collection => ({
			url: new URL(
				`/collections/${collection.slug ?? collection.id}`,
				baseUrl
			).toString(),
			lastModified: collection.updatedAt,
			changeFrequency: 'weekly' as const,
			priority: 0.7
		})),
		...richProfileIds.map(profileId => ({
			url: new URL(`/profile/${profileId}`, baseUrl).toString(),
			changeFrequency: 'weekly' as const,
			priority: 0.6
		}))
	];

	return entries;
};

export default sitemap;
