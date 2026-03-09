'use client';

import { signIn, useSession } from '#auth/client.ts';
import { Discord } from '#components/Icons.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import { UserAvatar, UserRoleText } from '#components/styled/User.tsx';

const UserSection = () => {
	const session = useSession();

	if (!session.data)
		return (
			<TextButton
				icon={<Discord />}
				onClick={() => signIn.social({ provider: 'discord' })}
				loading={session.isPending}
				className="self-center rounded-full border-2 border-current/30 px-4 py-3 text-2xl font-bold text-[#5865f2]"
			>
				Sign in with Discord
			</TextButton>
		);

	const user = session.data.user;

	return (
		<div className="flex items-center gap-2">
			<span className="text-blue-gray text-2xl">Welcome back</span>
			<UserAvatar image={user.image} size={32} />
			<UserRoleText role={user.role} className="text-2xl">
				{user.name}
			</UserRoleText>
		</div>
	);
};

export default UserSection;
