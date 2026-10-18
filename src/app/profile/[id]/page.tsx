import { type Metadata } from 'next';

import { getUserProfile } from '#server/api/users.ts';
import { invoke } from '#utils/index.ts';

import ProfilePage from './ProfilePage';

type Props = PageProps<'/profile/[id]'>;

export const generateMetadata = async ({
	params
}: Props): Promise<Metadata> => {
	const { id } = await params;
	const user = await invoke(getUserProfile({ id }));

	if (!user)
		return {
			title: 'Profile Not Found',
			description: 'This profile does not exist.',
			robots: { index: false, follow: false }
		};
	return {
		title: `${user.name}'s profile`,
		description: `View ${user.name}'s profile, talent trees, and builds`,
		alternates: { canonical: `/profile/${user.id}` }
	};
};

const Page = async ({ params }: Props) => {
	const { id } = await params;
	return <ProfilePage id={id} />;
};

export default Page;
