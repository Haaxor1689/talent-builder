import { useEffect, useState } from 'react';

const useLocalStorage = <T>(
	key: string,
	parse: (v: string) => T = JSON.parse
) => {
	const [storedValue, setStoredValue] = useState<T>();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		try {
			const item = window.localStorage.getItem(key);
			if (!item) return;
			setStoredValue(parse(item));
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key]);

	const setValue = (value: T | ((old?: T) => T) | undefined) => {
		try {
			// Allow value to be a function so we have same API as useState
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;
			// Save state
			setStoredValue(valueToStore);
			// Save to local storage
			if (typeof window !== 'undefined') {
				if (valueToStore === undefined) window.localStorage.removeItem(key);
				else window.localStorage.setItem(key, JSON.stringify(valueToStore));
			}
		} catch (error) {
			// A more advanced implementation would handle the error case
			console.log(error);
		}
	};
	return [storedValue, setValue, loading] as const;
};

export default useLocalStorage;
