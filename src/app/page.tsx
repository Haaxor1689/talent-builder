import { Suspense } from 'react';

import LocalTrees from './LocalTrees';
import PersonalTrees from './PersonalTrees';
import Spinner from './_components/styled/Spinner';
import PublicTrees from './PublicTrees';

const Home = async () => (
	<>
		<LocalTrees />

		<Suspense fallback={<Spinner className="self-center" />}>
			<PersonalTrees />
		</Suspense>

		<PublicTrees />
	</>
);
export default Home;
