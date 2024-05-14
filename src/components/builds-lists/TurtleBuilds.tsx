import { listTurtleSavedBuilds } from '~/server/api/routers/savedBuilds';

import BuildsGrid from './BuildsGrid';

const TurtleBuilds = async () => {
	const listPublic = await listTurtleSavedBuilds(undefined);

	return (
		!!listPublic.length && (
			<BuildsGrid
				title="Turtle WoW"
				list={listPublic.map(s => ({
					href: `/calculator/${s.id}`,
					...s
				}))}
			/>
		)
	);
};

export default TurtleBuilds;
