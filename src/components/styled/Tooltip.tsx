/* eslint-disable react-hooks/refs */
'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cls from 'classnames';
import { X } from 'lucide-react';

import useIsMobile from '#hooks/useIsMobile.ts';
import useMounted from '#hooks/useMounted.ts';

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
	tooltip: React.ReactNode;
	actions?: React.ReactNode;
	hidden?: boolean;
};

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
		<div className="haax-surface-3 gap-0">{tooltip}</div>
		{actions}
		<TextButton icon={X} onClick={closeDialog} className="text-red">
			Close
		</TextButton>
	</Dialog>
);

type Position = {
	top: number;
	left: number;
	right?: number;
	bottom?: number;
};

const DesktopTooltip = ({ children, tooltip, hidden }: Props) => {
	const [position, setPosition] = useState<Position>();

	const tooltipRef = useRef<HTMLDivElement>(null);
	const [container, setContainer] = useState<HTMLDialogElement | null>(null);

	const mounted = useMounted();

	return (
		<>
			{children({
				onMouseMove: e => {
					if (!tooltipRef.current) return;

					if (!container) setContainer(e.currentTarget.closest('dialog'));

					const tooltip = tooltipRef.current.getBoundingClientRect();

					const width = Math.min(window.innerWidth, document.body.clientWidth);
					const height = Math.min(
						window.innerHeight,
						document.body.clientHeight
					);

					const x = e.clientX + OFFSET;
					const y = e.clientY + OFFSET;

					const overflowX = Math.max(x + tooltip.width - width, 0);
					const overflowY = Math.max(y + tooltip.height - height, 0);

					const left = Math.max(x - overflowX, PADDING);
					const top = Math.max(y - overflowY, PADDING);
					const right = left + tooltip.width > width ? PADDING : undefined;
					const bottom = top + tooltip.height > height ? PADDING : undefined;

					setPosition({ left, top, right, bottom });
				},
				onMouseLeave: () => setPosition(undefined)
			})}

			{mounted &&
				createPortal(
					<div
						ref={tooltipRef}
						className={cls(
							'haax-surface-3 pointer-events-none fixed z-10 max-w-100 min-w-62.5 gap-0 backdrop-blur-xs',
							{ invisible: !position || !!hidden }
						)}
						style={position}
					>
						{tooltip}
					</div>,
					container ?? document.body
				)}
		</>
	);
};

const Tooltip = (props: Props) =>
	useIsMobile() ? <MobileTooltip {...props} /> : <DesktopTooltip {...props} />;

export default Tooltip;
