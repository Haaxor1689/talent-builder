import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { Filters, type FiltersT } from '~/server/api/types';
import PersonalTrees from '~/components/tree-lists/PersonalTrees';
import Spinner from '~/components/styled/Spinner';
import PublicTrees from '~/components/tree-lists/PublicTrees';
import TurtleTrees from '~/components/tree-lists/TurtleTrees';
import ProposalTrees from '~/components/tree-lists/ProposalTrees';
import Tabs from '~/components/Tabs';

import FiltersSection from './FiltersSection';

// export const experimental_ppr = true;

const Home = async ({ searchParams }: { searchParams: FiltersT }) => {
	const params = Filters.safeParse(searchParams);
	if (!params.success) notFound();

	return (
		<>
			<FiltersSection {...params.data} />

			<Suspense fallback={<Spinner className="my-6 self-center" />}>
				<Tabs
					tabs={{
						turtle: {
							title: 'Turtle WoW',
							component: <TurtleTrees {...params.data} />
						},
						proposals: {
							title: 'Proposals',
							component: <ProposalTrees {...params.data} />
						},
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
