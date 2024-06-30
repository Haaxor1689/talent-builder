import { listTurtleTalentTrees } from '~/server/api/routers/talentTree';
import { type FiltersT } from '~/server/api/types';

import TalentTreeGrid from './TalentTreeGrid';

const TurtleTrees = async (props: FiltersT) => {
	const list = await listTurtleTalentTrees(props);

	if (!list.length) return null;

	return (
		<TalentTreeGrid
			title="Turtle WoW"
			list={list.map(s => ({
				href: `/tree/${s.id}`,
				...s
			}))}
		/>
	);
};

export default TurtleTrees;
