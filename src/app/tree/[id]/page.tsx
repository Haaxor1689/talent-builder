import { notFound } from 'next/navigation';

import TalentBuilder from '~/components/builder/TalentBuilder';
import { getTalentTree } from '~/server/api/routers/talentTree';
import { getOgInfo } from '~/server/api/routers/openGraph';
import { env } from '~/env';

export type PageProps = {
	params: { id: string };
};

export const generateMetadata = async ({ params }: PageProps) => {
	const info = await getOgInfo(params.id);
	if (!info) return null;
	return {
		title: `${info.name} | Talent Builder`,
		description: `Talent tree created by ${info.user.name}`,
		icons: [{ rel: 'icon', url: `${env.DEPLOY_URL}/api/icon/${info.icon}` }]
	};
};

const TalentTreePage = async ({ params }: PageProps) => {
	if (!params.id || params.id === 'undefined') return notFound();
	const talentTree = await getTalentTree(params.id);
	if (!talentTree) return notFound();

	return <TalentBuilder defaultValues={talentTree} />;
};

export default TalentTreePage;
