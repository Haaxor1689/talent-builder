import { debounce, isEqual } from 'es-toolkit';
import { useEffect, useRef, useState } from 'react';

const useDebounced = <T>(value: T, wait = 300) => {
	const [state, setState] = useState(value);
	const debouncedRef = useRef(debounce(setState, wait));
	useEffect(() => {
		if (isEqual(value, state)) return;
		debouncedRef.current(value);
	}, [value, state]);
	return state;
};

export default useDebounced;
