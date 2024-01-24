'use client';

import { type TalentFormT } from '../../../server/api/types';
import useLocalStorage from '../hooks/useLocalStorage';
import Spinner from '../styled/Spinner';

import IconGrid from './IconGrid';

const LocalTrees = () => {
	const [savedSpecs, _, loading] =
		useLocalStorage<Record<string, TalentFormT>>('saved-specs');

	if (loading) return <Spinner className="self-center" />;

	if (!Object.values(savedSpecs ?? {}).length) return null;

	return (
		<IconGrid
			title="Local"
			list={Object.values(savedSpecs ?? {}).map(s => ({
				href: `/local/${s.id}`,
				...s,
				createdAt: null as never,
				updatedAt: null as never,
				createdById: null as never
			}))}
		/>
	);
};

export default LocalTrees;
