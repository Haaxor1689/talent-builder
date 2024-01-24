import { notFound } from 'next/navigation';

import TalentBuilder from '~/app/_components/builder/TalentBuilder';
import { getTalentTree } from '~/server/api/routers/talentTree';
import { getOgInfo } from '~/server/api/routers/openGraph';

export const generateMetadata = async ({
	params
}: {
	params: { id: string };
}) => {
	const info = await getOgInfo(params.id);
	if (!info) return null;
	return {
		title: `${info.name} | Talent Builder`,
		description: `Talent tree created by ${info.user.name}`,
		icons: [{ rel: 'icon', url: info.icon }]
	};
};

const TalentTreePage = async ({ params }: { params: { id: string } }) => {
	const talentTree = await getTalentTree(params.id);
	if (!talentTree) return notFound();
	return <TalentBuilder defaultValues={talentTree} />;
};

export default TalentTreePage;
