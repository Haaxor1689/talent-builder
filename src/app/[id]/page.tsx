import TalentBuilder from '~/app/[id]/TalentBuilder';
import { api } from '~/trpc/server';

import ClientLoader from './ClientLoader';
import NotFound from './NotFound';
import { db } from '~/server/db';
import { icons, talentTrees } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export const generateMetadata = async ({
	params
}: {
	params: { id: string };
}) => {
	const talentTree = await db.query.talentTrees.findFirst({
		where: eq(talentTrees.id, params.id)
	});
	if (!talentTree) return null;

	const icon = await db.query.icons.findFirst({
		where: eq(icons.name, talentTree.icon)
	});
	const iconSrc = `data:image/png;base64,${icon?.data}`;

	return {
		title: `${talentTree.name} | Talent Builder`,
		icons: [{ rel: 'icon', url: iconSrc }]
	};
};

type Props = {
	params: { id: string };
	searchParams: { [key: string]: string | string[] | undefined };
};

const TalentTreePage = async ({ params, searchParams }: Props) => {
	if (searchParams?.local !== undefined)
		return <ClientLoader localId={params.id} />;

	if (params.id === 'new') return <ClientLoader />;

	const talentTree = await api.talentTree.get.query(params.id);
	if (!talentTree) return <NotFound />;
	return <TalentBuilder defaultValues={talentTree} />;
};

export default TalentTreePage;
