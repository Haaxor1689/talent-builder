'use client';

import { SessionProvider } from 'next-auth/react';
import { type PropsWithChildren } from 'react';

const Providers = ({ children }: PropsWithChildren) => (
	<SessionProvider>{children}</SessionProvider>
);
export default Providers;
