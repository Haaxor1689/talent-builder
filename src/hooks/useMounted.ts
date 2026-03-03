import { useEffect, useState } from 'react';

const useMounted = () => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setMounted(true), 0);
		return () => clearTimeout(t);
	}, []);

	return mounted;
};

export default useMounted;
