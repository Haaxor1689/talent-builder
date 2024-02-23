import { Suspense } from 'react';
import { PlusCircle, Workflow } from 'lucide-react';

import UserStatus from './_components/session/UserStatus';
import Spinner from './_components/styled/Spinner';
import TextButton from './_components/styled/TextButton';

const Header = () => (
	<header className="flex max-w-screen-xl items-center gap-3 p-2 md:px-6 md:py-2 xl:mx-auto xl:w-full">
		<nav className="flex grow gap-1">
			<TextButton type="link" href="/" className="uppercase">
				<span className="tw-color hidden font-fontin text-4xl text-inherit md:inline">
					Talent builder
				</span>
				<span className="tw-color font-fontin text-4xl text-inherit md:hidden">
					TB
				</span>
			</TextButton>
			<TextButton type="link" href="/new-tree" icon={PlusCircle}>
				New tree
			</TextButton>
			<TextButton type="link" href="/calculator" icon={Workflow}>
				Calculator
			</TextButton>
		</nav>
		<Suspense fallback={<Spinner size={26} />}>
			<UserStatus />
		</Suspense>
	</header>
);

export default Header;
