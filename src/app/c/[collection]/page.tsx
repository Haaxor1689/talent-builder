import ClassCalculatorsLinks from '~/components/calculator/ClassCalculatorsLinks';
import { getCollectionTree } from '~/server/api/routers/collection';
import TreeGridItem from '~/components/tree-lists/TreeGridItem';

type PageProps = { params: { collection: string } };

export const generateMetadata = async ({ params }: PageProps) => {
	const title = params.collection.replaceAll('-', ' ');
	const capitalized = title[0]?.toUpperCase() + title.slice(1);
	return {
		title: `${capitalized} collection | Talent Builder`,
		description: 'Collection of talents'
	};
};

const TalentTreePage = async ({ params: { collection } }: PageProps) => {
	const trees = await Promise.all(
		[...new Array(9).keys()].flatMap(classIdx =>
			[...new Array(3).keys()].map(index =>
				getCollectionTree({ class: Math.pow(2, classIdx), index, collection })
			)
		)
	);

	return (
		<div className="flex flex-col gap-3">
			<div className="tw-surface">
				<h3 className="tw-color">{collection.replaceAll('-', ' ')}</h3>
			</div>

			<h4>Class talent calculators:</h4>
			<ClassCalculatorsLinks urlBase={`/c/${collection}/`} />

			<h4>Talent tree builders:</h4>

			<div className="tw-surface grow p-2 md:p-4">
				<div
					className="grid items-start gap-3"
					style={{
						gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))'
					}}
				>
					{trees.map(item =>
						!item ? null : (
							<TreeGridItem key={item.id} {...item} href={`/tree/${item.id}`} />
						)
					)}
				</div>
			</div>
		</div>
	);
};

export default TalentTreePage;
