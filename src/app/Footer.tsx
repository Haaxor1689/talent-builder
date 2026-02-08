import { Bug } from 'lucide-react';

import TextButton from '~/components/styled/TextButton';

const Footer = async () => (
	<footer className="text-blue-gray flex max-w-7xl items-center justify-center gap-1 p-2 md:px-6 md:py-2 xl:mx-auto xl:w-full">
		<p className="text-blue-gray pr-2 text-sm">Created by Haaxor1689</p>•
		<TextButton
			type="link"
			href="https://discord.gg/pDeTHQH99B"
			icon={Bug}
			iconSize={18}
			className="text-blue-gray shrink-0 text-sm"
		>
			Report a bug
		</TextButton>
		•
		<TextButton
			type="link"
			href="https://haaxor1689.dev/privacy-policy"
			className="text-blue-gray shrink-0 text-sm"
		>
			Privacy Policy
		</TextButton>
	</footer>
);

export default Footer;
