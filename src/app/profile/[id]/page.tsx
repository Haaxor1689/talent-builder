import { type Metadata } from 'next';

import { getUser } from '#server/api/users.ts';
import { invoke } from '#utils/index.ts';

import ProfilePage from './ProfilePage';

type Props = PageProps<'/profile/[id]'>;

export const generateMetadata = async ({
	params
}: Props): Promise<Metadata> => {
	const { id } = await params;
	const user = await invoke(getUser({ id }));

	if (!user) return {};
	return {
		title: `${user.name}'s profile`,
		description: `View ${user.name}'s profile, talent trees, and builds`
	};
};

const Page = async ({ params }: Props) => {
	const { id } = await params;
	return <ProfilePage id={id} />;
};

export default Page;
