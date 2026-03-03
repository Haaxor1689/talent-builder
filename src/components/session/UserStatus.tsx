'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import cls from 'classnames';
import { LogOut, Settings } from 'lucide-react';

import Discord from '../Discord';
import Spinner from '../styled/Spinner';
import TextButton from '../styled/TextButton';

const UserStatus = () => {
	const session = useSession();
	if (session.status === 'loading')
		return (
			<div className="mx-2 flex items-center">
				<Spinner size={26} />
			</div>
		);

	if (session.status === 'unauthenticated')
		return (
			<TextButton
				icon={Discord}
				onClick={() => signIn('discord')}
				className="text-[#5865f2] [&_span]:hidden [&_span]:md:inline"
			>
				Sign in
			</TextButton>
		);

	return (
		<>
			<div className="flex items-center gap-3">
				<span
					className={cls('hidden select-none sm:inline', {
						'text-green font-bold': session.data?.user.isAdmin
					})}
				>
					{session.data?.user.name}
				</span>
				<div
					className="size-8 rounded-full bg-contain"
					style={{
						backgroundImage: `url(${session.data?.user.image}), url(https://cdn.discordapp.com/embed/avatars/0.png)`
					}}
				/>
			</div>
			{session.data?.user.isAdmin && (
				<TextButton
					icon={Settings}
					title="Admin panel"
					type="link"
					href="/admin"
				/>
			)}
			<TextButton
				icon={LogOut}
				onClick={() => signOut()}
				className="[&_span]:hidden [&_span]:md:inline"
			>
				Sign out
			</TextButton>
		</>
	);
};

export default UserStatus;
