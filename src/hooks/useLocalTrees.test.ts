import assert from 'node:assert/strict';
import { test } from 'node:test';

import { TalentForm } from '#server/schemas.ts';

import { parseLocalTrees } from './useLocalTrees';

const legacyTree = {
	id: 'legacy-tree',
	name: 'Legacy local tree',
	class: 1,
	index: 2,
	collection: 'classic',
	createdAt: '2020-01-01T00:00:00.000Z',
	updatedAt: '2020-02-01T00:00:00.000Z',
	talents: [
		{ name: 'First talent', ranks: 5, description: 'First rank' },
		null,
		{ name: '', ranks: 0, description: null },
		{
			name: 'Dependent talent',
			ranks: 1,
			requires: 0,
			notes: 'Keep this note'
		}
	]
};

await test('legacy local trees load without the removed database columns', () => {
	const trees = parseLocalTrees(JSON.stringify([legacyTree]));
	const tree = trees[legacyTree.id];
	assert.ok(tree);
	assert.equal(tree.id, legacyTree.id);
	assert.equal(tree.name, legacyTree.name);
	assert.equal(tree.class, legacyTree.class);
	assert.equal(tree.visibility, null);
	assert.equal(tree.createdAt?.toISOString(), legacyTree.createdAt);
	assert.equal(tree.updatedAt?.toISOString(), legacyTree.updatedAt);
	assert.deepEqual(Object.keys(tree.talents), ['0', '3']);
	assert.equal(tree.talents['0']?.ranks, 5);
	assert.equal(tree.talents['0']?.description, 'First rank');
	assert.equal(tree.talents['3']?.requires, 0);
	assert.equal(tree.talents['3']?.notes, 'Keep this note');
	assert.equal('index' in tree, false);
	assert.equal('collection' in tree, false);
});

await test('object-backed local trees tolerate legacy column values', () => {
	const talents = {
		'7': { name: 'Sparse talent', ranks: 3, requires: 0 }
	};
	const trees = parseLocalTrees(
		JSON.stringify({
			[legacyTree.id]: { ...legacyTree, talents, index: null, collection: null }
		})
	);
	const tree = trees[legacyTree.id];
	assert.ok(tree);
	assert.deepEqual(Object.keys(tree.talents), ['7']);
	assert.equal(tree.talents['7']?.name, 'Sparse talent');
	assert.equal(tree.talents['7']?.ranks, 3);
	assert.equal(tree.talents['7']?.requires, 0);
});

await test('edited legacy local trees survive validation and a storage round trip', () => {
	const trees = parseLocalTrees(JSON.stringify({ oldKey: legacyTree }));
	const tree = trees[legacyTree.id];
	assert.ok(tree);
	const edited = TalentForm.parse({
		...tree,
		name: 'Edited legacy tree',
		talents: {
			...tree.talents,
			'0': { ...tree.talents['0'], ranks: 4 }
		}
	});
	const reloaded = parseLocalTrees(JSON.stringify({ [edited.id]: edited }));
	assert.deepEqual(reloaded[edited.id], edited);
	assert.equal(reloaded[edited.id]?.talents['0']?.ranks, 4);
	assert.equal(reloaded[edited.id]?.talents['3']?.requires, 0);
});
