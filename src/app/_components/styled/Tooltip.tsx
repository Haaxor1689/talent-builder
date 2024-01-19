'use client';

import {
	type ReactElement,
	type ReactNode,
	type Ref,
	cloneElement,
	createRef,
	useEffect,
	useState
} from 'react';

type Props = {
	tooltip?: ReactNode;
	children: ReactElement<{ ref?: Ref<HTMLElement> }>;
};

const Tooltip = ({ tooltip, children }: Props) => {
	const ref = createRef<HTMLElement>();

	const [position, setPosition] = useState<[number, number]>();
	useEffect(() => {
		if (typeof ref === 'function') return;
		const listener = (e: MouseEvent) => {
			setPosition([e.clientX, e.clientY]);
		};
		const leaveListener = () => {
			setPosition(undefined);
		};
		ref?.current?.addEventListener('mousemove', listener);
		ref?.current?.addEventListener('mouseleave', leaveListener);
		return () => {
			ref?.current?.removeEventListener('mousemove', listener);
			ref?.current?.removeEventListener('mouseleave', leaveListener);
		};
	}, []);
	return (
		<>
			{cloneElement(children, { ref })}
			{position && (
				<div
					className="pointer-events-none fixed z-10"
					style={{ top: position[1], left: position[0] }}
				>
					{tooltip}
				</div>
			)}
		</>
	);
};

export default Tooltip;
