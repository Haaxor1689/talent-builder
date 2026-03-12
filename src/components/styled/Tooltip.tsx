'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import useIsMobile from '#hooks/useIsMobile.tsx';

import Dialog, { closeDialog } from './Dialog';
import TextButton from './TextButton';

const PADDING = 8;
const OFFSET = 20;

type TriggerProps = {
	onClick?: (e: React.MouseEvent) => void;
	onMouseMove?: (e: React.MouseEvent) => void;
	onMouseLeave?: () => void;
};

type Props = {
	children: (props: TriggerProps) => React.ReactElement;
	tooltip: React.ReactNode | (() => React.ReactNode);
	actions?: React.ReactNode | (() => React.ReactNode);
	hidden?: boolean;
};

const resolveContent = (content?: React.ReactNode | (() => React.ReactNode)) =>
	typeof content === 'function' ? content() : content;

const MobileTooltip = ({ children, tooltip, actions }: Props) => (
	<Dialog
		trigger={open =>
			children({
				onClick: e => {
					e.preventDefault();
					open();
				}
			})
		}
		unstyled
		className="flex flex-col items-center gap-3"
	>
		<div className="group/tooltip pointer-events-none">{children({})}</div>
		<div className="haax-surface-3 gap-0">{resolveContent(tooltip)}</div>
		{resolveContent(actions)}
		<TextButton icon={<X />} onClick={closeDialog} className="text-red">
			Close
		</TextButton>
	</Dialog>
);

type Position = {
	top: number;
	left: number;
};

const DesktopTooltip = ({ children, tooltip, hidden }: Props) => {
	const tooltipRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDialogElement | null>(null);
	const rafRef = useRef<number | null>(null);
	const pointerRef = useRef<{ x: number; y: number } | null>(null);
	const lastPositionRef = useRef<{ left: number; top: number } | null>(null);
	const tooltipSizeRef = useRef<{ width: number; height: number }>({
		width: 0,
		height: 0
	});
	const isVisibleRef = useRef(false);
	const [hasPortal, setHasPortal] = useState(false);

	const setTooltipPosition = ({ top, left }: Position) => {
		const tooltip = tooltipRef.current;
		if (!tooltip) return;
		const last = lastPositionRef.current;
		if (last?.left === left && last?.top === top) return;

		lastPositionRef.current = { left, top };

		tooltip.style.transform = `translate3d(${left}px, ${top}px, 0)`;
	};

	const updateTooltipSize = () => {
		const tooltip = tooltipRef.current;
		if (!tooltip) return;

		const { width, height } = tooltip.getBoundingClientRect();
		tooltipSizeRef.current = { width, height };
	};

	const showTooltip = () => {
		if (!isVisibleRef.current) {
			isVisibleRef.current = true;
			updateTooltipSize();
		}
		tooltipRef.current?.classList.remove('invisible');
	};

	const hideTooltip = () => {
		if (!isVisibleRef.current) return;
		isVisibleRef.current = false;
		lastPositionRef.current = null;
		tooltipRef.current?.classList.add('invisible');
	};

	const updatePosition = () => {
		rafRef.current = null;
		const pointer = pointerRef.current;
		const tooltip = tooltipRef.current;
		if (!pointer || !tooltip || hidden) return;
		if (
			tooltipSizeRef.current.width === 0 ||
			tooltipSizeRef.current.height === 0
		) {
			updateTooltipSize();
		}

		const width = window.innerWidth;
		const height = window.innerHeight;
		const tooltipWidth = tooltipSizeRef.current.width;
		const tooltipHeight = tooltipSizeRef.current.height;

		const x = pointer.x + OFFSET;
		const y = pointer.y + OFFSET;

		const overflowX = Math.max(x + tooltipWidth - width, 0);
		const overflowY = Math.max(y + tooltipHeight - height, 0);

		const left = Math.max(x - overflowX, PADDING);
		const top = Math.max(y - overflowY, PADDING);

		setTooltipPosition({ left, top });
	};

	const schedulePositionUpdate = (x: number, y: number) => {
		pointerRef.current = { x, y };
		if (rafRef.current !== null) return;

		rafRef.current = window.requestAnimationFrame(updatePosition);
	};

	useEffect(
		() => () => {
			if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
			isVisibleRef.current = false;
			lastPositionRef.current = null;
			tooltipSizeRef.current = { width: 0, height: 0 };
		},
		[]
	);

	useEffect(() => {
		if (!hidden) return;

		pointerRef.current = null;
		if (rafRef.current !== null) {
			window.cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
		lastPositionRef.current = null;
		tooltipSizeRef.current = { width: 0, height: 0 };
		hideTooltip();
	}, [hidden]);

	return (
		<>
			{children({
				onMouseMove: e => {
					if (hidden) return;
					if (!hasPortal) setHasPortal(true);
					containerRef.current ??= e.currentTarget.closest('dialog');

					showTooltip();
					schedulePositionUpdate(e.clientX, e.clientY);
				},
				onMouseLeave: () => {
					pointerRef.current = null;
					if (rafRef.current !== null) {
						window.cancelAnimationFrame(rafRef.current);
						rafRef.current = null;
					}
					hideTooltip();
				}
			})}

			{typeof document !== 'undefined' &&
				hasPortal &&
				!hidden &&
				createPortal(
					<div
						ref={tooltipRef}
						className="haax-surface-3 pointer-events-none invisible fixed z-10 max-w-100 min-w-62.5 gap-0"
						style={{
							left: 0,
							top: 0,
							transform: `translate3d(${PADDING}px, ${PADDING}px, 0)`,
							willChange: 'transform'
						}}
					>
						{resolveContent(tooltip)}
					</div>,
					containerRef.current ?? document.body
				)}
		</>
	);
};

const Tooltip = (props: Props) =>
	useIsMobile() ? <MobileTooltip {...props} /> : <DesktopTooltip {...props} />;

export default Tooltip;
