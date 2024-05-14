import { listPublicTalentTrees } from '~/server/api/routers/talentTree';
import { type FiltersT } from '~/server/api/types';

import TalentTreeGrid from './TalentTreeGrid';

const PublicTrees = async (props: FiltersT) => {
	const listPublic = await listPublicTalentTrees(props).catch(() => []);
	if (!listPublic.length) return null;

	return (
		<TalentTreeGrid
			title="Public"
			list={listPublic.map(s => ({
				href: `/tree/${s.id}`,
				...s
			}))}
		/>
	);
};

export default PublicTrees;
