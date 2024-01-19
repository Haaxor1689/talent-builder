'use client';

import { useState } from 'react';

const useTooltip = (hide = false, offset = 20) => {
	const [position, setPosition] = useState<[number, number]>();

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
						style: {
							position: 'fixed',
							zIndex: 10,
							pointerEvents: 'none',
							top: position[1] + offset,
							left: position[0] + offset
						} as const
				  }
				: { style: { display: 'none' } }
	};
};

export default useTooltip;
