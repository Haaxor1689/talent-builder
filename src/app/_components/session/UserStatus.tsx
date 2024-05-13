import cls from 'classnames';

import { getSession } from '~/server/api/routers/general';

import SignInOut from './SignInOut';
import AdminPanel from './AdminPanel';

const UserStatus = async () => {
	const session = await getSession(undefined);
	if (!session) return <SignInOut signedIn={false} />;
	return (
		<>
			<div className="flex items-center gap-3">
				<span
					className={cls('hidden select-none sm:inline', {
						'font-bold text-green': session.user.isAdmin
					})}
				>
					{session.user.name}
				</span>
				<div
					className="size-8 rounded-full bg-contain"
					style={{ backgroundImage: `url(${session.user.image})` }}
				/>
			</div>
			{session.user.isAdmin && <AdminPanel />}
			<SignInOut signedIn />
		</>
	);
};

export default UserStatus;
