import { createHash } from 'node:crypto';

import { cacheTag } from 'next/cache';

type Category = 'users' | 'talentTrees' | 'savedBuilds' | 'collections';
type ContentCategory = Exclude<Category, 'users'>;
type Item = { id: string; createdById: string | null };
type Build = Item & {
	tree0Id: string | null;
	tree1Id: string | null;
	tree2Id: string | null;
};
type Collection = Item & { assignedTrees: Record<string, string> };

export const missingTag = (category: Category, input: string) => {
	const prefix = `${category}:missing:`;
	const key =
		prefix.length + input.length > 256 || input.startsWith('sha256:')
			? `sha256:${createHash('sha256').update(input).digest('hex')}`
			: input;
	return `${prefix}${key}`;
};

export const tagDependencies = (tags: Iterable<string>) => {
	const values = [...tags];
	for (let offset = 0; offset < values.length; offset += 128)
		cacheTag(...values.slice(offset, offset + 128));
};

const treeReferenceTags = (ids: (string | null)[]) =>
	ids.filter(id => id !== null).map(id => `talentTrees:id:${id}`);

const itemTags = (category: Category, item: Item) => [
	category,
	`${category}:id:${item.id}`,
	...(item.createdById === null ? [] : [`users:id:${item.createdById}`])
];

export const treeTags = (tree: Item) => itemTags('talentTrees', tree);

export const buildTags = (build: Build) => [
	...itemTags('savedBuilds', build),
	...treeReferenceTags([build.tree0Id, build.tree1Id, build.tree2Id])
];

export const collectionTags = (collection: Collection) => [
	...itemTags('collections', collection),
	...treeReferenceTags(Object.values(collection.assignedTrees))
];

export const itemWriteTags = (
	category: ContentCategory,
	item: Item & { slug?: string | null },
	previous?: { slug?: string | null }
) => {
	const tags = new Set([`${category}:id:${item.id}`]);
	const slug = item.slug === undefined ? previous?.slug : item.slug;
	if (!previous) {
		tags.add(missingTag(category, item.id));
		if (item.createdById !== null)
			tags.add(`${category}:owner:${item.createdById}`);
	}
	if (
		slug !== null &&
		slug !== undefined &&
		(!previous || slug !== previous.slug)
	)
		tags.add(missingTag(category, slug));
	return [...tags];
};
