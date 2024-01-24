import { Suspense } from 'react';

import LocalTrees from './_components/tree-lists/LocalTrees';
import PersonalTrees from './_components/tree-lists/PersonalTrees';
import Spinner from './_components/styled/Spinner';
import PublicTrees from './_components/tree-lists/PublicTrees';

const Home = async () => (
	<>
		<LocalTrees />

		<Suspense fallback={<Spinner className="my-6 self-center" />}>
			<PersonalTrees />
		</Suspense>

		<Suspense fallback={<Spinner className="my-6 self-center" />}>
			<PublicTrees />
		</Suspense>
	</>
);
export default Home;
