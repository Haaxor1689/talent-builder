import { useState } from 'react';
import toast from 'react-hot-toast';

const useAsyncAction = () => {
	const [loading, setDisableInteractions] = useState(false);
	const action =
		<T extends unknown[]>(fn: (...args: T) => Promise<unknown>) =>
		(...args: T) => {
			setDisableInteractions(true);
			return fn(...args)
				.catch(e => toast.error(e?.message ?? JSON.stringify(e)))
				.finally(() => setDisableInteractions(false));
		};

	return { loading, action };
};

export default useAsyncAction;
