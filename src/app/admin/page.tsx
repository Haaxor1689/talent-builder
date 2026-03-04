import { notFound } from 'next/navigation';

import { getSession } from '#auth/server.ts';

import PageContent from './PageContent';

const Page = async () => {
	const session = await getSession();
	if (session?.user.role !== 'admin') return notFound();
	return (
		<>
			<h2 className="haax-color mt-4 -mb-2 text-center">Admin Panel</h2>
			<PageContent />
		</>
	);
};

export default Page;
