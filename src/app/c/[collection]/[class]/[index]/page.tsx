import { notFound } from 'next/navigation';
import { z } from 'zod';

import TalentBuilder from '~/components/builder/TalentBuilder';
import { getOgInfo } from '~/server/api/routers/openGraph';
import { classMask, getIconPath } from '~/utils';
import { env } from '~/env';
import { getCollectionTree } from '~/server/api/routers/collection';

const ParamsSchema = z.object({
	collection: z.string(),
	class: z.preprocess(
		v =>
			Object.entries(classMask).find(
				m => m[1].name.toLocaleLowerCase() === v
			)?.[0] ?? 0,
		z.coerce.number()
	),
	index: z.coerce.number()
});

type PageProps = {
	params: z.infer<typeof ParamsSchema>;
};

export const generateMetadata = async ({ params }: PageProps) => {
	const parsed = ParamsSchema.safeParse(params);
	if (!parsed.success) return notFound();

	const talentTree = await getCollectionTree(parsed.data);
	if (!talentTree) return notFound();

	const info = await getOgInfo(talentTree.id);
	if (!info) return null;
	return {
		title: `${info.name} | Talent Builder`,
		description: `Talent tree created by ${info.user.name}`,
		icons: [{ rel: 'icon', url: env.DEPLOY_URL + getIconPath(info.icon) }]
	};
};

const TalentTreePage = async ({ params }: PageProps) => {
	const parsed = ParamsSchema.safeParse(params);
	if (!parsed.success) {
		console.dir(parsed.error, { depth: null });
		return notFound();
	}

	console.log(parsed.data);
	const talentTree = await getCollectionTree(parsed.data);
	if (!talentTree) return notFound();

	return <TalentBuilder defaultValues={talentTree} />;
};

export default TalentTreePage;
