import { listTurtleTalentTrees } from '~/server/api/routers/talentTree';
import { type FiltersT } from '~/server/api/types';

import IconGrid from './IconGrid';

const TurtleTrees = async (props: FiltersT) => {
	const listPublic = await listTurtleTalentTrees(props);

	if (!listPublic.length) return null;

	return (
		<IconGrid
			title="Turtle WoW"
			list={listPublic.map(s => ({
				href: `/tree/${s.id}`,
				...s
			}))}
		/>
	);
};

export default TurtleTrees;
