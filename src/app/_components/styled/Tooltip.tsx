'use client';

import cls from 'classnames';
import {
	type ReactElement,
	type ReactNode,
	cloneElement,
	useEffect,
	useLayoutEffect,
	useRef,
	useState
} from 'react';
import { X } from 'lucide-react';

import TextButton from './TextButton';

const PADDING = 8;

type Props = {
	children: ReactElement;
	tooltip: ReactNode;
	actions?: (close: () => void) => ReactNode;
	hide?: boolean;
	hideMobile?: boolean;
	offset?: number;
};

const Tooltip = ({
	children,
	tooltip,
	actions,
	hide = false,
	hideMobile = hide,
	offset = 20
}: Props) => {
	const [isMobile, setIsMobile] = useState(false);
	const [open, setOpen] = useState(false);

	const [mouse, setMouse] = useState<Record<'x' | 'y', number>>();
	const [position, setPosition] = useState<
		Partial<Record<'top' | 'left' | 'right' | 'bottom', number>>
	>({ top: 0, left: 0 });
	const [rect, setRect] = useState<{ width: number; height: number }>();

	const tooltipRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		setIsMobile(window.innerWidth < 768);

		const elem = tooltipRef.current;
		if (!elem) return;
		const clickAway = (e: MouseEvent) => {
			if (e.target !== elem) return;
			setOpen(false);
		};
		elem.addEventListener('click', clickAway);
		return () => elem.removeEventListener('click', clickAway);
	}, []);

	useLayoutEffect(() => {
		if (typeof window === 'undefined' || !tooltipRef.current) return;
		if (isMobile || !mouse) return;

		if (!rect) {
			const tooltip = tooltipRef.current.getBoundingClientRect();
			setRect({ width: tooltip.width, height: tooltip.height });
			return;
		}

		const tooltip = rect;

		const width = Math.min(window.innerWidth, document.body.clientWidth);
		const height = Math.min(window.innerHeight, document.body.clientHeight);

		const right = mouse.x + tooltip.width;
		const bottom = mouse.y + tooltip.height;

		const overflowX = Math.max(right - width, 0);
		const overflowY = Math.max(bottom - height, 0);

		const left = Math.max(mouse.x - overflowX, PADDING);
		const top = Math.max(mouse.y - overflowY, PADDING);

		setPosition({
			left,
			top,
			right: left + tooltip.width > width ? PADDING : undefined,
			bottom: top + tooltip.height > height ? PADDING : undefined
		});
	}, [isMobile, mouse, rect]);

	return (
		<>
			{cloneElement(
				children,
				isMobile
					? {
							onClick: (e: React.MouseEvent) => {
								e.preventDefault();
								setOpen(!open);
							}
					  }
					: {
							onMouseMove: (e: React.MouseEvent) => {
								if (isMobile) return;
								setMouse({ x: e.clientX + offset, y: e.clientY + offset });
							},
							onMouseLeave: () => {
								if (isMobile) return;
								setMouse(undefined);
							}
					  }
			)}
			<div
				ref={tooltipRef}
				className={cls(
					'fixed z-10 bg-darkerGray/90',
					isMobile
						? 'inset-0 flex flex-col items-center justify-center gap-4 p-4'
						: 'tw-surface pointer-events-none min-w-[250px] max-w-[400px]',
					{ hidden: (!open && !mouse) || (isMobile ? hideMobile : hide) }
				)}
				style={!isMobile ? position : undefined}
			>
				{isMobile ? (
					<>
						<div className="pointer-events-none shrink-0">{children}</div>
						<div className="tw-surface overflow-auto">{tooltip}</div>
						{actions?.(() => setOpen(false))}
						<TextButton
							icon={X}
							onClick={() => setOpen(false)}
							className="text-red"
						>
							Close
						</TextButton>
					</>
				) : (
					tooltip
				)}
			</div>
		</>
	);
};

export default Tooltip;
