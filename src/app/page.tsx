import { Suspense } from 'react';

import Spinner from '~/components/styled/Spinner';
import Collections from '~/components/tree-lists/Collections';
import TreeGrid from '~/components/tree-lists/TreeGrid';

import FiltersSection from './FiltersSection';

const Home = async () => (
	<>
		<h3 className="tw-color -mb-2 text-center">Browse Collections</h3>
		<Suspense fallback={<Spinner className="my-6 self-center" />}>
			<Collections />
		</Suspense>
		<h3 className="tw-color -mb-2 text-center">Browse custom talent trees</h3>
		<FiltersSection />
		<TreeGrid local values={{ sort: 'newest' }} />
	</>
);
export default Home;
