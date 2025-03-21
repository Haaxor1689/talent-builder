'use client';

import { type ComponentProps } from 'react';
import { useSession } from 'next-auth/react';

import { type FiltersT } from '~/server/api/types';
import Spinner from '~/components/styled/Spinner';
import useLocalTrees from '~/hooks/useLocalTrees';

import NoResults from '../NoResults';

import TalentTreeGrid from './TalentTreeGrid';

type Props = FiltersT & {
	serverList: ComponentProps<typeof TalentTreeGrid>['list'];
};

const LocalTrees = ({ serverList, name, from, class: classId }: Props) => {
	const [savedSpecs, _, loading] = useLocalTrees();

	const session = useSession();

	if (loading || session.status === 'loading')
		return (
			<div className="tw-surface flex grow items-center justify-center p-2 md:p-4">
				<Spinner className="my-6" />
			</div>
		);

	if (!serverList.length && !Object.values(savedSpecs ?? {}).length)
		return <NoResults />;

	return (
		<TalentTreeGrid
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
