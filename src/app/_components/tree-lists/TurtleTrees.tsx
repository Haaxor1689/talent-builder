import { listTurtleTalentTrees } from '~/server/api/routers/talentTree';

import IconGrid from './IconGrid';

const TurtleTrees = async () => {
	const listPublic = await listTurtleTalentTrees(undefined);

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
