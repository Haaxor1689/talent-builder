import Discord from '#components/Discord.tsx';
import MainActions from '#components/landing-page/MainActions.tsx';
import UserSection from '#components/landing-page/UserSection.tsx';
import TextButton from '#components/styled/TextButton.tsx';

const Home = async () => (
	<div className="flex min-h-[75vh] flex-col items-center justify-center gap-6">
		<div className="-mb-6 flex max-w-62.5 flex-wrap items-center justify-center gap-3 md:max-w-none">
			<img
				src="/icon.png"
				alt="Talent Builder logo"
				className="aspect-square h-18 [image-rendering:pixelated]"
			/>
			<h2 className="haax-color text-center text-7xl">Talent Builder</h2>
		</div>
		<p className="text-blue-gray mb-6">
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

		<div className="*:text-blue-gray flex flex-col gap-3 text-center **:text-lg">
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
				made by other users, that you can clone and modify as you like. You can
				then use the{' '}
				<TextButton type="link" href="/calculator" className="-m-2 inline-flex">
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
);
export default Home;
