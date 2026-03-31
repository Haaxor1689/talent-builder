import { PlusCircle } from 'lucide-react';
import { type Metadata } from 'next';

import FiltersSection from '#app/trees/FiltersSection.tsx';
import TreeGrid from '#app/trees/TreeGrid.tsx';
import PageTitle from '#components/layout/PageTitle.tsx';
import TextButton from '#components/styled/TextButton.tsx';

export const metadata: Metadata = {
	title: 'Talent Trees',
	description: 'Browse public custom talent trees'
};

const Page = () => (
	<>
		<PageTitle title="Talent Trees">
			<TextButton icon={<PlusCircle />} type="link" href="/tree/new">
				Create new
			</TextButton>
		</PageTitle>
		<FiltersSection />
		<TreeGrid />
	</>
);

export default Page;
