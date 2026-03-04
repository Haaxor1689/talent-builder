'use client';

import { useTransition } from 'react';
import cls from 'classnames';
import { LogOut, Settings } from 'lucide-react';

import { signIn, signOut, useSession } from '#auth/client.ts';
import Discord from '#components/Discord.tsx';
import Spinner from '#components/styled/Spinner.tsx';
import TextButton from '#components/styled/TextButton.tsx';

const UserStatus = () => {
	const session = useSession();
	const [isPending, startTransition] = useTransition();

	if (session.isPending)
		return (
			<div className="mx-2 flex items-center">
				<Spinner size={26} />
			</div>
		);

	if (!session.data)
		return (
			<TextButton
				icon={Discord}
				onClick={() =>
					startTransition(async () => {
						await signIn.social({ provider: 'discord' });
					})
				}
				loading={isPending}
				className="text-[#5865f2] [&_span]:hidden [&_span]:md:inline"
			>
				Sign in
			</TextButton>
		);

	const { name, image, role } = session.data.user;

	return (
		<>
			<div className="flex items-center gap-3">
				<span
					className={cls('hidden select-none sm:inline', {
						'text-green font-bold': role === 'admin',
						'text-[#41c8d4]': role === 'supporter'
					})}
				>
					{name}
				</span>
				<div
					className="size-8 rounded-full bg-contain"
					style={{
						backgroundImage: `url(${image}), url(https://cdn.discordapp.com/embed/avatars/0.png)`
					}}
				/>
			</div>
			{role === 'admin' && (
				<TextButton
					icon={Settings}
					title="Admin panel"
					type="link"
					href="/admin"
				/>
			)}
			<TextButton
				icon={LogOut}
				onClick={() =>
					startTransition(async () => {
						await signOut();
					})
				}
				loading={isPending}
				className="[&_span]:hidden [&_span]:md:inline"
			>
				Sign out
			</TextButton>
		</>
	);
};

export default UserStatus;
