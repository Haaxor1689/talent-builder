import FiltersSection from '#app/trees/FiltersSection.tsx';
import TreeGrid from '#app/trees/TreeGrid.tsx';

const Page = () => (
	<>
		<h2 className="haax-color mt-4 -mb-2 text-center">Talent Trees</h2>
		<FiltersSection />
		<TreeGrid values={{ sort: 'newest' }} />
	</>
);

export default Page;
