import { listPersonalSavedBuilds } from '~/server/api/routers/savedBuilds';
import { getServerAuthSession } from '~/server/auth';

import BuildsGrid from './BuildsGrid';

const PersonalBuilds = async () => {
	const session = await getServerAuthSession();
	if (!session) return null;
	const builds = await listPersonalSavedBuilds(undefined);
	if (!builds.length) return null;
	return (
		<BuildsGrid
			title="Personal"
			list={builds.map(s => ({
				href: `/calculator/${s.id}`,
				...s
			}))}
		/>
	);
};

export default PersonalBuilds;
