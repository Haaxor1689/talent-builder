import { getServerAuthSession } from '~/server/auth';

import SignInOut from './SignInOut';

const UserStatus = async () => {
	const session = await getServerAuthSession();
	if (!session) return <SignInOut signedIn={false} />;
	return (
		<>
			<div className="flex items-center gap-3">
				<span className="hidden select-none sm:inline">
					{session.user.name}
				</span>
				<div
					className="size-8 bg-contain"
					style={{ backgroundImage: `url(${session.user.image})` }}
				/>
			</div>
			<SignInOut signedIn />
		</>
	);
};

export default UserStatus;
