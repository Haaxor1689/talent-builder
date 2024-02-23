'use client';

import { type ComponentProps } from 'react';
import { useSession } from 'next-auth/react';

import { type FiltersT, type TalentFormT } from '../../../server/api/types';
import useLocalStorage from '../hooks/useLocalStorage';
import Spinner from '../styled/Spinner';

import TalentTreeGrid from './TalentTreeGrid';

type Props = FiltersT & {
	serverList: ComponentProps<typeof TalentTreeGrid>['list'];
};

const LocalTrees = ({ serverList, name, from, class: classId }: Props) => {
	const [savedSpecs, _, loading] =
		useLocalStorage<Record<string, TalentFormT>>('saved-specs');

	const session = useSession();

	if (loading || session.status === 'loading')
		return <Spinner className="self-center" />;

	if (!serverList.length && !Object.values(savedSpecs ?? {}).length)
		return null;

	return (
		<TalentTreeGrid
			title="Personal"
			list={[
				...serverList,
				...Object.values(savedSpecs ?? {})
					.filter(
						v =>
							(!name || v.name.match(name)) &&
							(!from || session.data?.user.name?.match(from)) &&
							(!classId || v.class === classId)
					)
					.map(s => ({
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
