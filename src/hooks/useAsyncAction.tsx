import { useTransition } from 'react';

import { toast } from '#components/ToastProvider.tsx';

const useAsyncAction = () => {
	const [isPending, startTransition] = useTransition();

	return [
		isPending,
		(callback: (currentTarget: EventTarget | null) => Promise<void>) =>
			(...args: any[]) => {
				const e = args[0] as React.MouseEvent;
				const currentTarget =
					e?.currentTarget instanceof EventTarget ? e.currentTarget : null;
				return startTransition(() =>
					callback(currentTarget).catch(err => {
						console.error('Async action error', err);
						toast({
							type: 'error',
							message:
								(err as Error)?.message ??
								'An unhandled exception occurred. Please report this to the developers.'
						});
					})
				);
			}
	] as const;
};
export default useAsyncAction;
