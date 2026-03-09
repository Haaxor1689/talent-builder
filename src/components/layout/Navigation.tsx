'use client';

import { usePathname } from 'next/navigation';
import {
	Calculator,
	LibraryBig,
	Menu,
	PlusCircle,
	Workflow
} from 'lucide-react';

import TextButton from '#components/styled/TextButton.tsx';

import Dialog, { closeDialog } from '../styled/Dialog';

const topNavigation = [
	{ href: '/tree/new', icon: <PlusCircle />, text: 'New Tree' },
	{ href: '/trees', icon: <Workflow />, text: 'Trees' },
	{ href: '/collections', icon: <LibraryBig />, text: 'Collections' },
	{ href: '/calculator', icon: <Calculator />, text: 'Calculator' }
] as const;

const Navigation = () => {
	const pathname = usePathname();
	return (
		<>
			{topNavigation.map(({ href, icon, text }) => (
				<TextButton
					key={href}
					icon={icon}
					type="link"
					href={href}
					active={pathname === href}
					className="hidden md:inline-flex"
				>
					{text}
				</TextButton>
			))}
			<Dialog
				trigger={open => (
					<TextButton
						icon={<Menu />}
						title="Import/Export"
						onClick={open}
						className="md:hidden"
					/>
				)}
			>
				<h3 className="haax-color">Navigation:</h3>
				{topNavigation.map(({ href, icon, text }) => (
					<TextButton
						key={href}
						icon={icon}
						type="link"
						href={href}
						active={pathname === href}
						onClick={closeDialog}
					>
						{text}
					</TextButton>
				))}
			</Dialog>
		</>
	);
};

export default Navigation;
