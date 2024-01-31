import { getServerAuthSession } from '~/server/auth';
import { listPersonalTalentTrees } from '~/server/api/routers/talentTree';

import LocalTrees from './LocalTrees';

const PersonalTrees = async () => {
	const session = await getServerAuthSession();
	if (!session) return <LocalTrees serverList={[]} />;

	const listPersonal = await listPersonalTalentTrees(undefined);
	if (!listPersonal.length) return <LocalTrees serverList={[]} />;

	return (
		<LocalTrees
			serverList={listPersonal.map(s => ({
				href: `/tree/${s.id}`,
				...s
			}))}
		/>
	);
};

export default PersonalTrees;
