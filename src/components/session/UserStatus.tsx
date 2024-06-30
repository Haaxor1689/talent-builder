'use client';

import cls from 'classnames';
import { useSession } from 'next-auth/react';
import { Settings } from 'lucide-react';

import Spinner from '../styled/Spinner';
import TextButton from '../styled/TextButton';

import SignInOut from './SignInOut';

const UserStatus = () => {
	const session = useSession();
	if (session.status === 'loading') return <Spinner size={26} />;
	if (session.status === 'unauthenticated')
		return <SignInOut signedIn={false} />;
	return (
		<>
			<div className="flex items-center gap-3">
				<span
					className={cls('hidden select-none sm:inline', {
						'font-bold text-green': session.data?.user.isAdmin
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
			<SignInOut signedIn />
		</>
	);
};

export default UserStatus;
