'use client';

import { type ComponentProps } from 'react';

import { type TalentFormT } from '../../../server/api/types';
import useLocalStorage from '../hooks/useLocalStorage';
import Spinner from '../styled/Spinner';

import IconGrid from './IconGrid';

const LocalTrees = ({
	serverList
}: {
	serverList: ComponentProps<typeof IconGrid>['list'];
}) => {
	const [savedSpecs, _, loading] =
		useLocalStorage<Record<string, TalentFormT>>('saved-specs');

	if (loading) return <Spinner className="self-center" />;

	if (!serverList.length && !Object.values(savedSpecs ?? {}).length)
		return null;

	return (
		<IconGrid
			title="Personal"
			list={[
				...serverList,
				...Object.values(savedSpecs ?? {}).map(s => ({
					href: `/local/${s.id}`,
					...s,
					createdAt: null as never,
					updatedAt: null as never,
					createdById: null as never,
					createdBy: null as never
				}))
			]}
		/>
	);
};

export default LocalTrees;
