import dedent from 'dedent';

import Discord from '#components/Discord.tsx';
import MainActions from '#components/landing-page/MainActions.tsx';
import UserSection from '#components/landing-page/UserSection.tsx';
import Md from '#components/styled/Md.tsx';
import TextButton from '#components/styled/TextButton.tsx';

const Home = async () => (
	<>
		<div className="flex min-h-[65vh] flex-col items-center justify-center gap-6 pt-6 md:pt-20">
			<div className="-mb-6 flex max-w-62.5 flex-wrap items-center justify-center gap-3 md:max-w-none">
				<img
					src="/icon.png"
					alt="Talent Builder logo"
					className="aspect-square h-18 [image-rendering:pixelated]"
				/>
				<h1 className="haax-color shrink text-center text-7xl">
					Talent Builder
				</h1>
			</div>
			<p className="text-blue-gray md:mb-6">
				Created by{' '}
				<TextButton
					type="link"
					href="https://haaxor1689.dev/"
					className="text-blue-gray -m-2 inline"
				>
					Haaxor1689
				</TextButton>
			</p>

			<UserSection />

			<MainActions />

			<div className="*:text-blue-gray flex flex-col gap-3 **:text-xl md:text-center">
				<p>
					Welcome to Talent Builder! You can use this tool to create completely
					custom World of Warcraft style talent trees.
				</p>
				<p>
					Start by{' '}
					<TextButton type="link" href="/tree/new" className="-m-2 inline-flex">
						creating a new tree
					</TextButton>{' '}
					from scratch, or{' '}
					<TextButton type="link" href="/trees" className="-m-2 inline-flex">
						browse public trees
					</TextButton>{' '}
					made by other users, that you can clone and modify as you like. You
					can then use the{' '}
					<TextButton
						type="link"
						href="/calculator"
						className="-m-2 inline-flex"
					>
						calculator tool
					</TextButton>{' '}
					to create builds with the custom trees, and share them with others.
				</p>
				<p>
					To save your trees, you will need to sign in with your{' '}
					<span className="text-[#5865f2] [&_svg]:mb-1 [&_svg]:inline [&_svg]:w-5">
						<Discord /> Discord
					</span>{' '}
					account.
				</p>
			</div>
		</div>

		<div className="flex max-w-4xl flex-col gap-3 self-center">
			<h2 className="mb-2 self-center border-b-2">Support the project</h2>

			<Md
				text={dedent`
				I build and maintain these projects in my spare time, and while I try to keep everything free to use, hosting and development time aren't free. If you find the tools useful and want to help them grow, please consider supporting me.

				Your donation helps to:
				
				- **Keep the services online** Servers, databases, monitoring, and domains all cost money every month. Donations go directly into covering these costs so the tools stay fast and reliable.
				- **Fund new features and improvements** More support means I can justify dedicating more time to building new features, polishing existing ones, fixing bugs faster, and experimenting with ideas that would otherwise stay on the backlog.
				- **Ad-free Talent Builder experience** Supporters get a special Discord role that unlocks an ad-free experience on my sites. This helps me rely less on ads and more on direct community support.
				- **Unlock extra features in Talent Builder** Donating also gives you access to additional features in Talent Builder (and other tools over time), so you get more powerful functionality while helping development.
				- **Shape the roadmap** As a supporter, you'll have more influence over what I work on next—through feedback, polls, and direct suggestions. Your voice carries more weight when I decide which features to prioritize.	
				
				Even if you can't contribute financially, sharing the projects with friends or providing feedback is a huge help. Every bit of support makes a difference and helps me keep building and improving these tools for everyone.
				
				`}
			/>

			<div className="flex flex-col gap-2 self-center md:flex-row">
				<TextButton
					type="link"
					icon={() => (
						<img
							src="https://storage.ko-fi.com/cdn/logomarkLogo.png"
							alt="Ko-fi logo"
							className="h-6 shrink-0 pr-1"
						/>
					)}
					href="https://ko-fi.com/haaxor1689"
					external
					className="self-center rounded-full border-2 border-current/30 px-4 py-3 text-2xl *:font-bold"
				>
					Donate on Ko‑fi
				</TextButton>
				<TextButton
					type="link"
					icon={Discord}
					iconSize={24}
					href="https://discord.gg/pDeTHQH99B"
					external
					className="self-center rounded-full border-2 border-current/30 px-4 py-3 text-2xl text-[#5865f2] *:font-bold"
				>
					Join Discord Server
				</TextButton>
			</div>
		</div>
	</>
);

export default Home;
