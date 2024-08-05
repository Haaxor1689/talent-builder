import { listTurtleTalentTrees } from '~/server/api/routers/talentTree';
import { type FiltersT } from '~/server/api/types';

import NoResults from '../NoResults';

import TalentTreeGrid from './TalentTreeGrid';

const TurtleTrees = async (props: FiltersT) => {
	const list = await listTurtleTalentTrees(props);

	if (!list.length) return <NoResults />;

	return (
		<TalentTreeGrid
			list={list.map(s => ({
				href: `/tree/${s.id}`,
				...s
			}))}
		/>
	);
};

export default TurtleTrees;
