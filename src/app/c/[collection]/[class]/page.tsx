import { notFound } from 'next/navigation';
import { z } from 'zod';

import { classMask, getIconPath, maskToClass } from '~/utils';
import { env } from '~/env';
import { getCollectionTree } from '~/server/api/routers/collection';
import TalentCalculator from '~/components/calculator/TalentCalculator';

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

type PageProps = {
	params: z.infer<typeof ParamsSchema>;
};

export const generateMetadata = async ({ params }: PageProps) => {
	const parsed = ParamsSchema.safeParse(params);
	if (!parsed.success) return notFound();

	const info = maskToClass(parsed.data.class);
	if (!info) return notFound();

	const collection = parsed.data.collection.replaceAll('-', ' ');

	return {
		title: `${collection} ${info.name} | Talent Calculator`,
		description: `Talent calculator from collection ${collection}.`,
		icons: [{ rel: 'icon', url: env.DEPLOY_URL + getIconPath(info.icon) }]
	};
};

const TalentTreePage = async ({ params }: PageProps) => {
	const parsed = ParamsSchema.safeParse(params);
	if (!parsed.success) {
		return notFound();
	}

	const trees = await Promise.all([
		getCollectionTree({ ...parsed.data, index: 0 }),
		getCollectionTree({ ...parsed.data, index: 1 }),
		getCollectionTree({ ...parsed.data, index: 2 })
	] as const);

	return (
		<TalentCalculator
			urlBase={`/c/${parsed.data.collection}/`}
			trees={trees}
			values={{ class: parsed.data.class }}
		/>
	);
};

export default TalentTreePage;
