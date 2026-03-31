import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { z } from 'zod';

import TalentCalculator from '#components/calculator/TalentCalculator.tsx';
import { env } from '#env.js';
import { getCollection, getCollectionTree } from '#server/api/collection.ts';
import { classMask, getIconPath, invoke, maskToClass } from '#utils/index.ts';

type Props = PageProps<'/collections/[collection]/[class]'>;

const ParamsSchema = z.object({
	collection: z.string(),
	class: z.preprocess(
		v =>
			Object.entries(classMask).find(
				m => m[1].name.toLocaleLowerCase() === v
			)?.[0] ?? 0,
		z.coerce.number()
	)
});

export const generateMetadata = async ({
	params
}: Props): Promise<Metadata> => {
	const parsed = ParamsSchema.safeParse(await params);
	if (!parsed.success) return notFound();

	const info = maskToClass(parsed.data.class);
	if (!info) return notFound();

	const collection = await invoke(
		getCollection({ slugOrId: parsed.data.collection })
	);
	if (!collection) return notFound();

	return {
		title: `${collection.name} ${info.name}`,
		description: `Talent calculator from collection ${collection.name}.`,
		icons: [{ rel: 'icon', url: getIconPath(info.icon, env.DEPLOY_URL) }]
	};
};

const TalentTreePage = async ({ params }: Props) => {
	const parsed = ParamsSchema.safeParse(await params);
	if (!parsed.success) {
		return notFound();
	}

	const trees = await Promise.all([
		invoke(getCollectionTree({ ...parsed.data, index: 0 })),
		invoke(getCollectionTree({ ...parsed.data, index: 1 })),
		invoke(getCollectionTree({ ...parsed.data, index: 2 }))
	] as const);

	return (
		<TalentCalculator
			urlBase={`/collections/${parsed.data.collection}/`}
			trees={trees}
			values={{
				class: parsed.data.class,
				rows: Math.max(...trees.map(t => t?.rows ?? 7))
			}}
		/>
	);
};

export default TalentTreePage;
