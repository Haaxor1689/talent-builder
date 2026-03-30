import { type Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from 'sonner';

import Footer from '#components/layout/Footer.tsx';
import Header from '#components/layout/Header.tsx';
import PageBackground from '#components/layout/PageBackground.tsx';
import Providers from '#components/layout/Providers.tsx';
import { env } from '#env.js';

import '../theme.css';

const fontin = localFont({
	src: '../assets/FontinSans-Regular.otf',
	variable: '--font-fontin'
});

const din = localFont({
	src: '../assets/DINPro-Regular.otf',
	variable: '--font-din'
});

export const metadata: Metadata = {
	title: { default: 'Talent Builder', template: '%s | Talent Builder' },
	description:
		'A tool for creating and sharing your custom World of Warcraft talent trees and builds',
	icons: [{ rel: 'icon', url: '/icon.png' }],
	metadataBase: new URL(env.DEPLOY_URL)
};

const RootLayout = async ({ children }: LayoutProps<'/'>) => (
	<html lang="en">
		<head>
			{process.env.NODE_ENV === 'production' ? (
				<>
					{/* Google Ads */}
					<meta
						name="google-adsense-account"
						content="ca-pub-8795217129609015"
					/>
					<Script
						id="adsense-global"
						async
						strategy="afterInteractive"
						src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8795217129609015"
						crossOrigin="anonymous"
					/>
					{/* Anti AI scrape */}
					<meta name="robots" content="noai, noimageai" />
					<meta name="googlebot" content="noai" />
					<meta httpEquiv="X-Robots-Tag" content="noai, noimageai" />
				</>
			) : (
				<Script
					src="//unpkg.com/react-scan/dist/auto.global.js"
					crossOrigin="anonymous"
					strategy="beforeInteractive"
				/>
			)}
		</head>
		<body
			className={`${fontin.variable} ${din.variable} flex min-h-screen flex-col items-stretch overflow-auto overflow-x-hidden bg-dark-gray`}
		>
			<PageBackground />
			<Providers>
				<Header />
				<main className="flex max-w-7xl shrink grow flex-col gap-6 p-2 py-4 md:px-6 xl:mx-auto xl:w-full">
					{children}
				</main>
				<Footer />
				<Toaster />
			</Providers>
			<SpeedInsights />
			<Analytics />
		</body>
	</html>
);

export default RootLayout;
