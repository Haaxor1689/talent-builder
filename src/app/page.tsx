import { Suspense } from 'react';

import PersonalTrees from './_components/tree-lists/PersonalTrees';
import Spinner from './_components/styled/Spinner';
import PublicTrees from './_components/tree-lists/PublicTrees';
import TurtleTrees from './_components/tree-lists/TurtleTrees';

const Home = async () => (
	<>
		<Suspense fallback={<Spinner className="my-6 self-center" />}>
			<PersonalTrees />
		</Suspense>

		<Suspense fallback={<Spinner className="my-6 self-center" />}>
			<PublicTrees />
		</Suspense>

		<Suspense fallback={<Spinner className="my-6 self-center" />}>
			<TurtleTrees />
		</Suspense>
	</>
);
export default Home;
