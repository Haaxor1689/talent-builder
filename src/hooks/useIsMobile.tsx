'use client';

import { useEffect } from 'react';
import { atom, useAtomValue, useSetAtom } from 'jotai';

const MOBILE_BREAKPOINT = 768;
const isMobileAtom = atom(false);

export const MobileStateSync = () => {
	const setIsMobile = useSetAtom(isMobileAtom);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const updateIsMobile = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};

		updateIsMobile();
		window.addEventListener('resize', updateIsMobile);
		return () => window.removeEventListener('resize', updateIsMobile);
	}, [setIsMobile]);

	return null;
};

const useIsMobile = () => useAtomValue(isMobileAtom);

export default useIsMobile;
