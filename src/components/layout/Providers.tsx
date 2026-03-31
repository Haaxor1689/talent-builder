'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { type PropsWithChildren } from 'react';

import { MobileStateSync } from '#hooks/useIsMobile.tsx';

const queryClient = new QueryClient();

const Providers = ({ children }: PropsWithChildren) => (
	<JotaiProvider>
		<QueryClientProvider client={queryClient}>
			<MobileStateSync />
			{children}
		</QueryClientProvider>
	</JotaiProvider>
);
export default Providers;
