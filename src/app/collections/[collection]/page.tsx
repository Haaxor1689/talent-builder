import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import CollectionPage from '#components/collection/CollectionPage.tsx';
import { getCollection, getCollectionTrees } from '#server/api/collection.ts';
import { invoke } from '#utils/index.ts';

type Props = PageProps<'/collections/[collection]'>;

export const generateMetadata = async ({
	params
}: Props): Promise<Metadata> => {
	const { collection } = await params;
	const item = await invoke(getCollection({ slugOrId: collection }));
	if (!item) return notFound();
	return {
		title: `${item.name} collection`,
		description: 'Collection of talents'
	};
};

const TalentTreePage = async ({ params }: Props) => {
	const { collection } = await params;
	const [item, trees] = await Promise.all([
		invoke(getCollection({ slugOrId: collection })),
		invoke(getCollectionTrees({ slugOrId: collection }))
	]);

	if (!item) return notFound();

	return <CollectionPage defaultValues={item} trees={trees} />;
};

export default TalentTreePage;
