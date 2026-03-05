import { type Metadata } from 'next';

import TreeGridItem from '#app/trees/TreeGridItem.tsx';
import ClassCalculatorsLinks from '#components/calculator/ClassCalculatorsLinks.tsx';
import { getCollectionTree } from '#server/api/collection.ts';
import { classMask } from '#utils/index.ts';

type Props = PageProps<'/collections/[collection]'>;

export const generateMetadata = async ({
	params
}: Props): Promise<Metadata> => {
	const { collection } = await params;
	const title = collection.replaceAll('-', ' ');
	const capitalized = title[0]?.toUpperCase() + title.slice(1);
	return {
		title: `${capitalized} collection | Talent Builder`,
		description: 'Collection of talents'
	};
};

const TalentTreePage = async ({ params }: Props) => {
	const { collection } = await params;
	const trees = await Promise.all(
		[...new Array(9).keys()].flatMap(classIdx =>
			[...new Array(3).keys()].map(index =>
				getCollectionTree({
					class: Number(Object.keys(classMask)[classIdx]),
					index,
					collection
				})
			)
		)
	);

	return (
		<>
			<h2 className="mt-4 -mb-2 flex flex-wrap justify-center gap-2 text-center">
				<span className="h2">Collection:</span>
				<span className="h2 haax-color shrink uppercase">
					{collection.replaceAll('-', ' ')}
				</span>
			</h2>

			<h3 className="-mb-3">Talent calculators:</h3>
			<ClassCalculatorsLinks urlBase={`/collections/${collection}/`} />

			<h3 className="-mb-3">Talent trees:</h3>
			<div className="haax-surface-3 grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] items-start">
				{trees.map(item =>
					!item ? null : (
						<TreeGridItem key={item.id} {...item} href={`/tree/${item.id}`} />
					)
				)}
			</div>
		</>
	);
};

export default TalentTreePage;
