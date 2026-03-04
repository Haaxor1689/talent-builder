'use client';

import cls from 'classnames';

import { signIn, useSession } from '#auth/client.ts';
import Discord from '#components/Discord.tsx';
import TextButton from '#components/styled/TextButton.tsx';

const UserSection = () => {
	const session = useSession();

	if (!session.data)
		return (
			<TextButton
				icon={Discord}
				iconSize={24}
				onClick={() => signIn.social({ provider: 'discord' })}
				loading={session.isPending}
				className="text-2xl text-[#5865f2]"
			>
				Sign in with Discord
			</TextButton>
		);

	const user = session.data.user;

	return (
		<div className="flex items-center gap-3">
			<span className="text-blue-gray">Welcome back </span>
			<div
				className="size-8 rounded-full bg-contain"
				style={{
					backgroundImage: `url(${user.image}), url(https://cdn.discordapp.com/embed/avatars/0.png)`
				}}
			/>
			<span
				className={cls({
					'text-green font-bold': user.role === 'admin',
					'text-[#41c8d4]': user.role === 'supporter'
				})}
			>
				{user.name}
			</span>
		</div>
	);
};

export default UserSection;
