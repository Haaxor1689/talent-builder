import { listPublicTalentTrees } from '~/server/api/routers/talentTree';
import { type FiltersT } from '~/server/api/types';

import IconGrid from './IconGrid';

const PublicTrees = async (props: FiltersT) => {
	const listPublic = await listPublicTalentTrees(props);

	if (!listPublic.length) return null;

	return (
		<IconGrid
			title="Public"
			list={listPublic.map(s => ({
				href: `/tree/${s.id}`,
				...s
			}))}
		/>
	);
};

export default PublicTrees;
