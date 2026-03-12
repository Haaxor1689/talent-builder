'use client';

import { type PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';

const queryClient = new QueryClient();

const Providers = ({ children }: PropsWithChildren) => (
	<QueryClientProvider client={queryClient}>
		<JotaiProvider>{children}</JotaiProvider>
	</QueryClientProvider>
);
export default Providers;
