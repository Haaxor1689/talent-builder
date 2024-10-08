import '~/styles/globals.css';

import localFont from 'next/font/local';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

import { env } from '~/env';

import Providers from './Providers';
import Header from './Header';
import Footer from './Footer';
import PageBackground from './PageBackground';

const fontin = localFont({
	src: '../assets/FontinSans-Regular.otf',
	variable: '--fontin-font'
});

const din = localFont({
	src: '../assets/DINPro-Regular.otf',
	variable: '--din-font'
});

export const metadata = {
	title: 'Talent Builder',
	description: 'Simple talent builder app for Turtle WoW',
	icons: [{ rel: 'icon', url: '/icon.png' }],
	metadataBase: new URL(env.DEPLOY_URL)
};

type Props = {
	children: React.ReactNode;
};

const RootLayout = async ({ children }: Props) => (
	<html lang="en">
		<body
			className={`${fontin.variable} ${din.variable} flex min-h-screen flex-col items-stretch overflow-auto overflow-x-hidden bg-darkGray`}
		>
			<PageBackground />
			<Providers>
				<Header />
				<main className="flex max-w-screen-xl grow flex-col gap-6 p-2 pt-0 md:px-6 xl:mx-auto xl:w-full">
					{children}
				</main>
				<Footer />
			</Providers>
			<SpeedInsights />
			<Analytics />
		</body>
	</html>
);

export default RootLayout;
