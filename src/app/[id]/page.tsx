import TalentBuilder from '~/app/[id]/TalentBuilder';
import { api } from '~/trpc/server';

import ClientLoader from './ClientLoader';
import NotFound from './NotFound';

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
