import { getSession } from '#auth/server.ts';
import { listPersonalSavedBuilds } from '#server/api/savedBuilds.ts';

import BuildsGrid from './BuildsGrid';

const PersonalBuilds = async () => {
	const session = await getSession();
	if (!session) return null;
	const builds = await listPersonalSavedBuilds();
	if (!builds.length) return null;
	return (
		<BuildsGrid
			title="Saved"
			list={builds.map(s => ({
				href: `/calculator/${s.id}`,
				...s
			}))}
		/>
	);
};

export default PersonalBuilds;
