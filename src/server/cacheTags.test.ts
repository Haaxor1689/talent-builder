import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	buildTags,
	collectionTags,
	itemWriteTags,
	missingTag,
	treeTags
} from './cacheTags';

await test('hits include entity, owner, and referenced IDs without missing tags', () => {
	assert.deepEqual(treeTags({ id: 'tree', createdById: 'owner' }), [
		'talentTrees',
		'talentTrees:id:tree',
		'users:id:owner'
	]);
	assert.deepEqual(treeTags({ id: 'tree', createdById: null }), [
		'talentTrees',
		'talentTrees:id:tree'
	]);
	assert.deepEqual(
		buildTags({
			id: 'build',
			createdById: 'owner',
			tree0Id: 'first',
			tree1Id: null,
			tree2Id: 'third'
		}),
		[
			'savedBuilds',
			'savedBuilds:id:build',
			'users:id:owner',
			'talentTrees:id:first',
			'talentTrees:id:third'
		]
	);
});

await test('collection dependencies retain more than 128 assigned trees', () => {
	const assignedTrees = Object.fromEntries(
		Array.from({ length: 150 }, (_, index) => [
			`slot:${index}`,
			`tree:${index}`
		])
	);
	const tags = collectionTags({
		id: 'collection',
		createdById: 'owner',
		assignedTrees
	});
	assert.equal(tags.length, 153);
	assert.ok(tags.includes('talentTrees:id:tree:149'));
});

await test('ID and slug misses share one namespace, including empty input', () => {
	assert.equal(missingTag('talentTrees', 'input'), 'talentTrees:missing:input');
	assert.equal(missingTag('users', 'id'), 'users:missing:id');
	assert.equal(missingTag('collections', ''), 'collections:missing:');
});

await test('oversized missing keys are deterministic, bounded, and unambiguous', () => {
	const input = 'long-slug'.repeat(100);
	const tag = missingTag('talentTrees', input);
	assert.ok(tag.length <= 256);
	assert.equal(tag, missingTag('talentTrees', input));
	assert.notEqual(tag, missingTag('talentTrees', `${input}different`));
	assert.notEqual(
		tag,
		missingTag('talentTrees', tag.slice('talentTrees:missing:'.length))
	);
});

await test('inserts expire ID and slug misses plus the actual owner list, not users', () => {
	assert.deepEqual(
		itemWriteTags('talentTrees', {
			id: 'tree',
			slug: 'slug',
			createdById: 'owner'
		}),
		[
			'talentTrees:id:tree',
			'talentTrees:missing:tree',
			'talentTrees:owner:owner',
			'talentTrees:missing:slug'
		]
	);
	assert.deepEqual(
		itemWriteTags('savedBuilds', {
			id: 'same',
			slug: 'same',
			createdById: null
		}),
		['savedBuilds:id:same', 'savedBuilds:missing:same']
	);
});

await test('updates expire only the item and a newly assigned slug miss', () => {
	const item = { id: 'collection', createdById: 'owner' };
	assert.deepEqual(
		itemWriteTags('collections', { ...item, slug: 'new' }, { slug: 'old' }),
		['collections:id:collection', 'collections:missing:new']
	);
	for (const slug of ['old', null, undefined]) {
		assert.deepEqual(
			itemWriteTags('collections', { ...item, slug }, { slug: 'old' }),
			['collections:id:collection']
		);
	}
	assert.deepEqual(
		itemWriteTags('collections', { ...item, slug: '' }, { slug: 'old' }),
		['collections:id:collection', 'collections:missing:']
	);
});
