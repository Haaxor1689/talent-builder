import { Bug } from 'lucide-react';

import TextButton from '~/components/styled/TextButton';

const Footer = async () => (
	<footer className="text-blue-gray flex max-w-7xl flex-wrap items-center justify-center gap-3 p-2 md:px-6 md:py-2 xl:mx-auto xl:w-full">
		<p className="text-sm text-blueGray">Created by Haaxor1689</p>•
		<TextButton
			type="link"
			icon={() => (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src="https://storage.ko-fi.com/cdn/logomarkLogo.png"
					alt="Ko-fi logo"
					className="h-4 shrink-0 pr-1"
				/>
			)}
			href="https://ko-fi.com/haaxor1689"
			className="-m-2"
		>
			Support me
		</TextButton>
		•
		<TextButton
			type="link"
			href="https://discord.gg/pDeTHQH99B"
			icon={Bug}
			iconSize={18}
			className="-m-2 shrink-0 text-sm text-orange"
		>
			Report a bug
		</TextButton>
		•
		<TextButton
			type="link"
			href="https://haaxor1689.dev/privacy-policy"
			className="-m-2 shrink-0 text-sm text-blueGray"
		>
			Privacy Policy
		</TextButton>
	</footer>
);

export default Footer;
