'use client';

import cls from 'classnames';
import { useSession } from 'next-auth/react';

import Spinner from '../styled/Spinner';

import SignInOut from './SignInOut';
import AdminPanel from './AdminPanel';

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
					style={{ backgroundImage: `url(${session.data?.user.image})` }}
				/>
			</div>
			{session.data?.user.isAdmin && <AdminPanel />}
			<SignInOut signedIn />
		</>
	);
};

export default UserStatus;
