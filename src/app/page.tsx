import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { Filters, type FiltersT } from '~/server/api/types';
import PersonalTrees from '~/components/tree-lists/PersonalTrees';
import Spinner from '~/components/styled/Spinner';
import PublicTrees from '~/components/tree-lists/PublicTrees';
import TurtleTrees from '~/components/tree-lists/TurtleTrees';

import FiltersSection from './FiltersSection';

const Home = async ({ searchParams }: { searchParams: FiltersT }) => {
	const params = Filters.safeParse(searchParams);
	if (!params.success) notFound();

	return (
		<>
			<FiltersSection {...params.data} />

			<Suspense fallback={<Spinner className="my-6 self-center" />}>
				<PersonalTrees {...params.data} />
			</Suspense>

			<Suspense fallback={<Spinner className="my-6 self-center" />}>
				<PublicTrees {...params.data} />
			</Suspense>

			<Suspense fallback={<Spinner className="my-6 self-center" />}>
				<TurtleTrees {...params.data} />
			</Suspense>
		</>
	);
};
export default Home;
