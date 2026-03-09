import { type Metadata } from 'next';

import FiltersSection from '#app/trees/FiltersSection.tsx';
import TreeGrid from '#app/trees/TreeGrid.tsx';

export const metadata: Metadata = {
	title: 'Talent Trees',
	description: 'Browse public custom talent trees'
};

const Page = () => (
	<>
		<h2 className="haax-color -mb-3 text-center md:text-left">Talent Trees</h2>
		<FiltersSection />
		<TreeGrid />
	</>
);

export default Page;
