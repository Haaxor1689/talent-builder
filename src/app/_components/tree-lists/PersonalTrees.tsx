import { getServerAuthSession } from '~/server/auth';
import { listPersonalTalentTrees } from '~/server/api/routers/talentTree';

import IconGrid from './IconGrid';

const PersonalTrees = async () => {
	const session = await getServerAuthSession();
	if (!session) return null;

	const listPersonal = await listPersonalTalentTrees(undefined);
	if (!listPersonal.length) return null;

	return (
		<IconGrid
			title="Personal"
			list={listPersonal.map(s => ({
				href: `/tree/${s.id}`,
				...s
			}))}
		/>
	);
};

export default PersonalTrees;
