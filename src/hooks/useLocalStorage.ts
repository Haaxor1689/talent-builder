import { useState } from 'react';

import { logger } from '#utils/index.ts';

const getInit = <T>(key: string, parse: (v: string) => T = JSON.parse) => {
	if (typeof window === 'undefined') return undefined;
	try {
		const item = window.localStorage.getItem(key);
		if (!item) return undefined;
		return parse(item);
	} catch (error) {
		logger.error(error);
		return undefined;
	}
};

const useLocalStorage = <T>(
	key: string,
	parse: (v: string) => T = JSON.parse
) => {
	const [storedValue, setStoredValue] = useState(() => getInit<T>(key, parse));

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
			logger.error(error);
		}
	};
	return [storedValue, setValue] as const;
};

export default useLocalStorage;
