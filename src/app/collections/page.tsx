import { type Metadata } from 'next';

import CreateDialog from '#components/collection/CreateDialog.tsx';
import PageTitle from '#components/layout/PageTitle.tsx';

import CollectionsFiltersSection from './CollectionsFiltersSection';
import CollectionsGrid from './CollectionsGrid';

export const metadata: Metadata = {
	title: 'Talent Collections',
	description: 'Browse public talent collections',
	alternates: { canonical: '/collections' }
};

const Page = () => (
	<>
		<PageTitle title="Talent Collections">
			<CreateDialog />
		</PageTitle>
		<CollectionsFiltersSection />
		<CollectionsGrid />
	</>
);

export default Page;
