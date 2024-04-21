'use client';

import { useLayoutEffect, useRef, useState } from 'react';

const useTooltip = (hide = false, offset = 20) => {
	const [position, setPosition] = useState<[number, number]>();

	const [rightOverflow, setRightOverflow] = useState(false);
	const [bottomOverflow, setBottomOverflow] = useState(false);

	const tooltipRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		if (!position || !tooltipRef.current) return;
		const tooltipRect = tooltipRef.current.getBoundingClientRect();
		setRightOverflow(position[0] + tooltipRect.width > window.innerWidth);
		setBottomOverflow(position[1] + tooltipRect.height > window.innerHeight);
	}, [position]);

	return {
		elementProps: {
			onMouseMove: (e: React.MouseEvent) => {
				setPosition([e.clientX, e.clientY]);
			},
			onMouseLeave: () => {
				setPosition(undefined);
			}
		},
		tooltipProps:
			position && !hide
				? {
						ref: tooltipRef,
						style: {
							position: 'fixed',
							zIndex: 10,
							pointerEvents: 'none',
							top: position[1] + offset,
							left: position[0] + offset,
							transform: `translate(${
								rightOverflow ? `calc(-100% - ${offset * 2}px)` : 0
							}, ${bottomOverflow ? `calc(-100% - ${offset * 2}px)` : 0})`
						} as const
				  }
				: { style: { display: 'none' } }
	};
};

export default useTooltip;
