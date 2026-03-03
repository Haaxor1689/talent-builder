'use client';

import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

import TextButton from '#components/styled/TextButton.tsx';
import { topNavigation } from '#utils.ts';

import Dialog, { closeDialog } from '../styled/Dialog';

const Navigation = () => {
	const pathname = usePathname();
	return (
		<>
			{topNavigation.map(({ href, icon, text }) => (
				<TextButton
					key={href}
					type="link"
					href={href}
					active={pathname === href}
					icon={icon}
					className="hidden md:inline-flex"
				>
					{text}
				</TextButton>
			))}
			<Dialog
				trigger={open => (
					<TextButton
						onClick={open}
						icon={Menu}
						title="Import/Export"
						className="md:hidden"
					/>
				)}
			>
				<h3 className="haax-color">Navigation:</h3>
				{topNavigation.map(({ href, icon, text }) => (
					<TextButton
						key={href}
						type="link"
						href={href}
						active={pathname === href}
						icon={icon}
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
