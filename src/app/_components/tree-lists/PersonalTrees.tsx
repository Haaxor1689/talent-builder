import { getServerAuthSession } from '~/server/auth';
import { listPersonalTalentTrees } from '~/server/api/routers/talentTree';
import { type FiltersT } from '~/server/api/types';

import LocalTrees from './LocalTrees';

const PersonalTrees = async (props: FiltersT) => {
	const session = await getServerAuthSession();
	if (!session) return <LocalTrees {...props} serverList={[]} />;

	const listPersonal = await listPersonalTalentTrees(props);
	if (!listPersonal.length) return <LocalTrees {...props} serverList={[]} />;

	return (
		<LocalTrees
			{...props}
			serverList={listPersonal.map(s => ({
				href: `/tree/${s.id}`,
				...s
			}))}
		/>
	);
};

export default PersonalTrees;
