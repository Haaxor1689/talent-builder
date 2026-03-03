'use client';

import { type PropsWithChildren } from 'react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const Providers = ({ children }: PropsWithChildren) => (
	<SessionProvider>
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	</SessionProvider>
);
export default Providers;
