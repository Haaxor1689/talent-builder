import { listPublicTalentTrees } from '~/server/api/routers/talentTree';
import { type FiltersT } from '~/server/api/types';

import TalentTreeGrid from './TalentTreeGrid';

const PublicTrees = async (props: FiltersT) => {
	const list = await listPublicTalentTrees(props).catch(() => []);
	if (!list.length) return null;

	return (
		<TalentTreeGrid
			title="Public"
			list={list.map(s => ({
				href: `/tree/${s.id}`,
				...s
			}))}
		/>
	);
};

export default PublicTrees;
