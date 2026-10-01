import { ArrowLeft } from 'lucide-react';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { z } from 'zod';

import TalentCalculator from '#components/calculator/TalentCalculator.tsx';
import ClassNotes from '#components/collection/ClassNotes.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import { env } from '#env.js';
import { getCollection, getCollectionTree } from '#server/api/collection.ts';
import { classMask, getIconPath, invoke, maskToClass } from '#utils/index.ts';

type Props = PageProps<'/collections/[collection]/[class]'>;

const ParamsSchema = z.object({
	collection: z.string(),
	class: z.preprocess(v => {
		const name = decodeURIComponent(String(v)).replaceAll(' ', '-');
		return (
			Object.entries(classMask).find(
				m => m[1].name.toLocaleLowerCase().replaceAll(' ', '-') === name
			)?.[0] ?? 0
		);
	}, z.coerce.number())
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

	const [collection, tree0, tree1, tree2] = await Promise.all([
		invoke(getCollection({ slugOrId: parsed.data.collection })),
		invoke(getCollectionTree({ ...parsed.data, index: 0 })),
		invoke(getCollectionTree({ ...parsed.data, index: 1 })),
		invoke(getCollectionTree({ ...parsed.data, index: 2 }))
	] as const);
	if (!collection) return notFound();

	const trees: [typeof tree0, typeof tree1, typeof tree2] = [
		tree0,
		tree1,
		tree2
	];
	const classIds = Object.keys(classMask)
		.map(Number)
		.filter(classId =>
			[0, 1, 2].some(tab => collection.assignedTrees[`${classId}:${tab}`])
		);

	return (
		<>
			<TextButton
				type="link"
				href={`/collections/${parsed.data.collection}`}
				icon={<ArrowLeft />}
				className="-mb-3 self-start"
			>
				Back to {collection.name ?? 'collection'}
			</TextButton>
			<TalentCalculator
				urlBase={`/collections/${parsed.data.collection}/`}
				classIds={classIds}
				trees={trees}
				values={{
					class: parsed.data.class,
					rows: Math.max(...trees.map(t => t?.rows ?? 7))
				}}
				footer={
					<ClassNotes collection={collection} classId={parsed.data.class} />
				}
			/>
		</>
	);
};

export default TalentTreePage;
