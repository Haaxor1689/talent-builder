'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { type PropsWithChildren } from 'react';
import { Toaster, resolveValue } from 'react-hot-toast';
import { AlertCircle, CheckCircle, ClipboardCopy } from 'lucide-react';

import TextButton from '~/components/styled/TextButton';

const queryClient = new QueryClient();

const Providers = ({ children }: PropsWithChildren) => (
	<SessionProvider>
		<QueryClientProvider client={queryClient}>
			{children}
			<Toaster>
				{t => {
					const msgString = typeof t.message === 'string' ? t.message : '';
					return (
						<div className="tw-surface flex max-w-sm items-center gap-2 bg-darkGray">
							{t.type === 'error' && (
								<AlertCircle size={18} className="shrink-0 text-red" />
							)}
							{t.type === 'success' && (
								<CheckCircle size={18} className="shrink-0 text-green" />
							)}
							<p title={msgString} className="truncate">
								{resolveValue(t.message, t)}
							</p>

							{t.type === 'error' && msgString && (
								<TextButton
									title="Copy message"
									onClick={() => navigator.clipboard.writeText(msgString)}
									icon={ClipboardCopy}
									className="-m-2 shrink-0"
								/>
							)}
						</div>
					);
				}}
			</Toaster>
		</QueryClientProvider>
	</SessionProvider>
);
export default Providers;
