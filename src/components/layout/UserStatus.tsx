'use client';

import { useTransition } from 'react';
import { LogOut } from 'lucide-react';

import { signIn, signOut, useSession } from '#auth/client.ts';
import { Discord } from '#components/Icons.tsx';
import Spinner from '#components/styled/Spinner.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import { UserAvatar, UserRoleText } from '#components/styled/User.tsx';

const UserStatus = () => {
	const session = useSession();
	const [isPending, startTransition] = useTransition();

	if (session.isPending)
		return (
			<div className="mx-2 flex items-center">
				<Spinner className="icon-size-8" />
			</div>
		);

	if (!session.data)
		return (
			<TextButton
				icon={<Discord />}
				onClick={() =>
					startTransition(async () => {
						await signIn.social({
							provider: 'discord',
							callbackURL: window.location.pathname + window.location.search
						});
					})
				}
				loading={isPending}
				className="text-[#5865f2]"
			>
				Sign in
			</TextButton>
		);

	const { name, image, role } = session.data.user;

	return (
		<>
			<TextButton
				icon={<UserAvatar image={image} size={32} />}
				type="link"
				href="/profile"
			>
				<UserRoleText role={role}>{name}</UserRoleText>
			</TextButton>
			<TextButton
				icon={<LogOut />}
				title="Sign out"
				onClick={() =>
					startTransition(async () => {
						await signOut();
					})
				}
				loading={isPending}
			/>
		</>
	);
};

export default UserStatus;
