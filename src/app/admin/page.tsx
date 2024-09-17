import { notFound } from 'next/navigation';

import { getServerAuthSession } from '~/server/auth';

import PageContent from './PageContent';

const Page = async () => {
	const session = await getServerAuthSession();
	if (!session?.user.isAdmin) return notFound();
	return <PageContent />;
};

export default Page;
