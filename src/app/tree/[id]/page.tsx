import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import TalentBuilder from '#components/builder/TalentBuilder.tsx';
import { env } from '#env.js';
import { getOgInfo } from '#server/api/routers/openGraph.ts';
import { getTalentTree } from '#server/api/routers/talentTree.ts';
import { getIconPath } from '#utils.ts';

type Props = PageProps<'/tree/[id]'>;
export const generateMetadata = async ({
	params
}: Props): Promise<Metadata> => {
	const { id } = await params;
	const info = await getOgInfo(id);
	if (!info) return {};
	return {
		title: `${info.name} | Talent Builder`,
		description: `Talent tree created by ${info.user.name}`,
		icons: [{ rel: 'icon', url: env.DEPLOY_URL + getIconPath(info.icon) }]
	};
};

const TalentTreePage = async ({ params }: Props) => {
	const { id } = await params;
	const talentTree = await getTalentTree(id);
	if (!talentTree) return notFound();

	return <TalentBuilder defaultValues={talentTree} />;
};

export default TalentTreePage;
