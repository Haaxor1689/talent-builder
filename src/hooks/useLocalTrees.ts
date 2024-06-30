import { TalentForm, type TalentFormT } from '~/server/api/types';

import useLocalStorage from './useLocalStorage';

const parseLocalTrees = (v: string) => {
	const val = JSON.parse(v);
	if (!val || typeof val !== 'object') return {};
	return Object.fromEntries(
		Object.values(val)
			.map(v => {
				if (!v || typeof v !== 'object') return undefined;
				const parsed = TalentForm.safeParse(
					'tree' in v
						? {
								...v,
								talents: v.tree
						  }
						: v
				);
				if (!parsed.success) return undefined;
				return [parsed.data.id, parsed.data];
			})
			.filter((v): v is [string, TalentFormT] => !!v)
	);
};

const useLocalTrees = () => useLocalStorage('saved-specs', parseLocalTrees);
export default useLocalTrees;
