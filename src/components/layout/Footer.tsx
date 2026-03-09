import { Bug } from 'lucide-react';

import TextButton from '#components/styled/TextButton.tsx';

const Footer = async () => (
	<>
		<p className="text-blue-gray mx-auto -mb-2 max-w-7xl p-2 text-center text-xs">
			All World of Warcraft assets (including images, logos, text, audio, and
			other game content) used on this site are the property of Blizzard
			Entertainment, Inc. and are used here with no claim of ownership or
			endorsement by Blizzard Entertainment. World of Warcraft and Blizzard
			Entertainment are trademarks or registered trademarks of Blizzard
			Entertainment, Inc.
		</p>
		<footer className="text-blue-gray flex max-w-7xl flex-wrap items-center justify-center gap-3 p-2 md:px-6 md:py-2 xl:mx-auto xl:w-full">
			<p className="text-blue-gray truncate text-sm whitespace-nowrap">
				Created by{' '}
				<TextButton
					type="link"
					href="https://haaxor1689.dev/"
					className="text-blue-gray -m-2 inline-flex text-sm"
				>
					Haaxor1689
				</TextButton>
			</p>
			•
			<TextButton
				type="link"
				icon={
					<img
						src="https://storage.ko-fi.com/cdn/logomarkLogo.png"
						alt="Ko-fi logo"
						className="h-4 pr-1"
					/>
				}
				href="https://ko-fi.com/haaxor1689"
				className="-m-2"
			>
				Support me
			</TextButton>
			•
			<TextButton
				type="link"
				href="https://discord.gg/pDeTHQH99B"
				icon={<Bug />}
				className="text-orange icon-size-4 -m-2 text-sm"
			>
				Report a bug
			</TextButton>
			•
			<TextButton
				type="link"
				href="https://haaxor1689.dev/privacy-policy"
				className="text-blue-gray -m-2 text-sm"
			>
				Privacy Policy
			</TextButton>
		</footer>
	</>
);

export default Footer;
