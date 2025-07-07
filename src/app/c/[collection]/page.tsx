import ClassCalculatorsLinks from '~/components/calculator/ClassCalculatorsLinks';
import TreeGrid from '~/components/tree-lists/TreeGrid';

type PageProps = { params: { collection: string } };

export const generateMetadata = async ({ params }: PageProps) => {
	const title = params.collection.replaceAll('-', ' ');
	const capitalized = title[0]?.toUpperCase() + title.slice(1);
	return {
		title: `${capitalized} collection | Talent Builder`,
		description: 'Collection of talents'
	};
};

const TalentTreePage = async ({ params }: PageProps) => (
	<div className="flex flex-col gap-3">
		<div className="tw-surface">
			<h3 className="tw-color">{params.collection.replaceAll('-', ' ')}</h3>
		</div>

		<h4>Class talent calculators:</h4>
		<ClassCalculatorsLinks urlBase={`/c/${params.collection}/`} />

		<h4>Talent tree builders:</h4>
		<TreeGrid limit={3 * 9} values={params} />
	</div>
);

export default TalentTreePage;
