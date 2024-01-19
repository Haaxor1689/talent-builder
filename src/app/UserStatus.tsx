'use client';

import { LogIn, LogOut } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';

import TextButton from './_components/styled/TextButton';
import Spinner from './_components/styled/Spinner';

const UserStatus = () => {
	const session = useSession();

	if (session.status === 'loading') return <Spinner />;

	return (
		<>
			{session.data && (
				<div className="flex items-center gap-3">
					{session.data.user.name}
					<div
						className="size-8 bg-contain"
						style={{ backgroundImage: `url(${session.data.user.image})` }}
					/>
				</div>
			)}
			<TextButton
				icon={session.data ? LogOut : LogIn}
				onClick={session.data ? () => signOut() : () => signIn('discord')}
			>
				{session.data ? 'Sign out' : 'Sign in'}
			</TextButton>
		</>
	);
};

export default UserStatus;
