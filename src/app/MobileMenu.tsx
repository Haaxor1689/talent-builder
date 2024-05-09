'use client';

import { Menu } from 'lucide-react';

import { topNavigation } from '~/utils';

import DialogButton from './_components/styled/DialogButton';
import TextButton from './_components/styled/TextButton';

const MobileMenu = () => (
	<DialogButton
		clickAway
		dialog={close => (
			<div className="tw-surface flex flex-col gap-4 bg-darkGray/90">
				{topNavigation.map(({ href, icon, text }) => (
					<TextButton
						key={href}
						type="link"
						href={href}
						icon={icon}
						onClick={close}
					>
						{text}
					</TextButton>
				))}
			</div>
		)}
	>
		{open => (
			<TextButton
				onClick={open}
				icon={Menu}
				title="Import/Export"
				className="md:hidden"
			/>
		)}
	</DialogButton>
);

export default MobileMenu;
