import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import TalentBuilder from '#components/builder/TalentBuilder.tsx';
import { env } from '#env.js';
import { getOgInfo } from '#server/api/openGraph.ts';
import { getTalentTree } from '#server/api/talentTree.ts';
import { getIconPath } from '#utils/index.ts';

type Props = PageProps<'/tree/[id]'>;

export const generateMetadata = async ({
	params
}: Props): Promise<Metadata> => {
	const { id } = await params;
	const info = await getOgInfo({ id });
	if (!info) return {};
	return {
		title: info.name,
		description: `Talent tree created by ${info.createdBy.name}`,
		icons: [{ rel: 'icon', url: getIconPath(info.icon, env.DEPLOY_URL) }]
	};
};

const Page = async ({ params }: Props) => {
	const { id } = await params;
	const talentTree = await getTalentTree({ id });
	if (!talentTree) return notFound();
	return <TalentBuilder defaultValues={talentTree} />;
};

export default Page;
