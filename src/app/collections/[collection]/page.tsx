import { type Metadata } from 'next';

import ClassCalculatorsLinks from '#components/calculator/ClassCalculatorsLinks.tsx';
import TreeGridItem from '#components/styled/TreeGridItem.tsx';
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
		title: `${capitalized} collection`,
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
			<h1 className="-mb-3 flex flex-wrap justify-center gap-2 text-center md:text-left">
				<span className="h1">Collection:</span>
				<span className="h1 haax-color shrink uppercase">
					{collection.replaceAll('-', ' ')}
				</span>
			</h1>

			<h2 className="haax-color -mb-3 text-center md:text-left">
				Talent calculators:
			</h2>
			<ClassCalculatorsLinks urlBase={`/collections/${collection}/`} />

			<h2 className="haax-color -mb-3 text-center md:text-left">
				Talent trees:
			</h2>
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
