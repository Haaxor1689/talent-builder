import { Suspense } from 'react';

import TextButton from '#components/styled/TextButton.tsx';

import Navigation from './Navigation';
import UserStatus from './UserStatus';

const Header = () => (
	<header className="haax-surface-3 mb-3 max-w-7xl flex-row items-center gap-1 border-t-0 p-2 md:px-6 md:py-2 xl:mx-auto xl:w-full">
		<nav className="contents">
			<TextButton type="link" href="/">
				<img
					src="/icon.png"
					alt="Talent Builder logo"
					className="aspect-square h-10"
				/>
			</TextButton>
			<Suspense>
				<Navigation />
			</Suspense>
		</nav>
		<div className="grow" />
		<UserStatus />
	</header>
);

export default Header;
