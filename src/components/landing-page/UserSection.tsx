'use client';

import { signIn, useSession } from 'next-auth/react';

import Discord from '#components/Discord.tsx';
import TextButton from '#components/styled/TextButton.tsx';

const UserSection = () => {
	const session = useSession();

	if (session.status !== 'authenticated')
		return (
			<TextButton
				icon={Discord}
				iconSize={24}
				onClick={() => signIn('discord')}
				loading={session.status === 'loading'}
				className="text-2xl text-[#5865f2]"
			>
				Sign in with Discord
			</TextButton>
		);

	const user = session.data?.user;

	return (
		<div className="flex items-center gap-3">
			<span className="text-blue-gray">Welcome back </span>
			<div
				className="size-8 rounded-full bg-contain"
				style={{
					backgroundImage: `url(${user?.image}), url(https://cdn.discordapp.com/embed/avatars/0.png)`
				}}
			/>
			<span className={user?.isAdmin ? 'text-green font-bold' : undefined}>
				{user?.name}
			</span>
		</div>
	);
};

export default UserSection;
