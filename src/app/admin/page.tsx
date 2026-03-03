import { notFound } from 'next/navigation';

import { getServerAuthSession } from '#server/auth.ts';

import PageContent from './PageContent';

const Page = async () => {
	const session = await getServerAuthSession();
	if (!session?.user.isAdmin) return notFound();
	return (
		<>
			<h2 className="haax-color mt-4 -mb-2 text-center">Admin Panel</h2>
			<PageContent />
		</>
	);
};

export default Page;
