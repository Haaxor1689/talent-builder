import '~/styles/globals.css';

import localFont from 'next/font/local';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { noop } from 'lodash-es';

import { TRPCReactProvider } from '~/trpc/react';

import TextButton from './_components/styled/TextButton';
import UserStatus from './UserStatus';
import Providers from './Providers';

const fontin = localFont({
	src: './_components/assets/FontinSans-Regular.otf',
	variable: '--fontin-font'
});

const din = localFont({
	src: './_components/assets/DINPro-Regular.otf',
	variable: '--din-font'
});

export const metadata = {
	title: 'Talent Builder',
	description: 'Simple talent builder app for Turtle WoW',
	icons: [{ rel: 'icon', url: '/icon.png' }]
};

type Props = {
	children: React.ReactNode;
};

const RootLayout = async ({ children }: Props) => (
	<html lang="en">
		<body
			className={`${fontin.variable} ${din.variable} flex min-h-screen flex-col overflow-auto bg-darkGray bg-cover bg-top bg-no-repeat`}
			style={{ backgroundImage: 'url("/page_background.png")' }}
		>
			<Providers>
				<TRPCReactProvider cookies={cookies().toString()}>
					<main className="mx-auto flex w-full max-w-screen-xl grow flex-col gap-4 p-1 md:p-6">
						<div className="flex items-center gap-3 p-4">
							<h3>Talent builder</h3>
							<Link href="/">
								<TextButton type="submit">Home</TextButton>
							</Link>
							<Link href="/new">
								<TextButton type="submit">New</TextButton>
							</Link>
							<div className="grow" />
							<UserStatus />
						</div>
						{children}
					</main>
				</TRPCReactProvider>
			</Providers>
		</body>
	</html>
);

export default RootLayout;
