import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { Filters, type FiltersT } from '~/server/api/types';
import PersonalTrees from '~/components/tree-lists/PersonalTrees';
import Spinner from '~/components/styled/Spinner';
import PublicTrees from '~/components/tree-lists/PublicTrees';
import Tabs from '~/components/Tabs';
import Collections from '~/components/tree-lists/Collections';

import FiltersSection from './FiltersSection';

// export const experimental_ppr = true;

const Home = async ({ searchParams }: { searchParams: FiltersT }) => {
	const params = Filters.safeParse(searchParams);
	if (!params.success) notFound();

	return (
		<>
			<h3 className="tw-color -mb-2 text-center">Browse Collections</h3>
			<Suspense fallback={<Spinner className="my-6 self-center" />}>
				<Collections />
			</Suspense>
			<h3 className="tw-color -mb-2 text-center">Browse custom talent trees</h3>
			<FiltersSection {...params.data} />
			<Suspense fallback={<Spinner className="my-6 self-center" />}>
				<Tabs
					tabs={{
						personal: {
							title: 'Personal',
							component: <PersonalTrees {...params.data} />
						},
						public: {
							title: 'Public',
							component: <PublicTrees {...params.data} />
						}
					}}
				/>
			</Suspense>
		</>
	);
};
export default Home;
