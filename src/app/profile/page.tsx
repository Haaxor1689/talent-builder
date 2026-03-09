import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getSession } from '#auth/server.ts';

import ProfilePage from './[id]/ProfilePage';

export const metadata: Metadata = {
	title: 'Profile',
	description: 'View your profile'
};

const Page = async () => {
	const session = await getSession();
	if (!session?.user) return notFound();
	return <ProfilePage id={session.user.id} />;
};

export default Page;
