'use client';

import { useLocalStorage } from 'usehooks-ts';

import { TalentForm } from '#server/schemas.ts';

const parseLocalTrees = (v: string) => {
	const val = JSON.parse(v) as unknown;
	if (!val || typeof val !== 'object') return {};
	return Object.fromEntries(
		Object.values(val)
			.map(v => {
				const parsed = TalentForm.safeParse(v);
				if (!parsed.success) return undefined;
				return [parsed.data.id, parsed.data] as const;
			})
			.filter(v => v !== undefined)
	);
};

const useLocalTrees = () => {
	const [localTrees, setLocalTrees] = useLocalStorage(
		'saved-specs',
		undefined,
		{
			deserializer: parseLocalTrees,
			serializer: JSON.stringify,
			initializeWithValue: false
		}
	);
	return {
		localTrees,
		upsertTree: (tree: TalentForm) =>
			setLocalTrees(trees => ({
				...trees,
				[tree.id]: {
					...tree,
					createdById: null,
					createdBy: null,
					createdAt: tree.createdAt ?? new Date(),
					updatedAt: new Date()
				}
			})),
		deleteTree: (id: string) =>
			setLocalTrees(trees => {
				const { [id]: _, ...newTrees } = trees ?? {};
				return newTrees;
			})
	};
};

export default useLocalTrees;
