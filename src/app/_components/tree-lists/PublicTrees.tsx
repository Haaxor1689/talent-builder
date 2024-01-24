import { listPublicTalentTrees } from '~/server/api/routers/talentTree';

import IconGrid from './IconGrid';

const PublicTrees = async () => {
	const listPublic = await listPublicTalentTrees(undefined);

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
