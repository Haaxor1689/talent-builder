import { useRef, useState } from 'react';
import { Dialog as Base } from '@base-ui/react/dialog';
import cls from 'classnames';

export const closeDialog = (event: Pick<Event, 'currentTarget'>) => {
	window.dispatchEvent(
		new CustomEvent('dialog-close', { detail: event.currentTarget })
	);
};

type Props = {
	trigger: (open: (...args: unknown[]) => void) => React.ReactNode;
	children: React.ReactNode;
	defaultOpen?: boolean;
	unstyled?: boolean;
	className?: string;
	style?: React.CSSProperties;
	onOpenChange?: (open: boolean) => void;
};

const Dialog = ({
	trigger,
	children,
	defaultOpen,
	unstyled,
	className,
	style,
	onOpenChange
}: Props) => {
	const ref = useRef<HTMLDivElement>(null);
	const cbRef = useRef<((e: Event) => void) | null>(null);

	const [open, setOpen] = useState(defaultOpen ?? false);

	const handleOpenChange = (open: boolean) => {
		setOpen(open);
		onOpenChange?.(open);
		if (open) {
			cbRef.current = (e: Event) => {
				const sender = (e as CustomEvent).detail as HTMLElement | undefined;
				if (!sender || !ref.current?.contains(sender)) return;
				handleOpenChange(false);
			};
			window.addEventListener('dialog-close', cbRef.current);
		} else {
			cbRef.current &&
				window.removeEventListener('dialog-close', cbRef.current);
			cbRef.current = null;
		}
	};

	return (
		<Base.Root open={open} onOpenChange={handleOpenChange}>
			{/* eslint-disable-next-line react-hooks/refs */}
			{trigger(() => handleOpenChange(true))}
			<Base.Portal>
				<Base.Backdrop className="haax-backdrop-blur" />
				<Base.Viewport>
					<Base.Popup
						ref={ref}
						className={cls(
							'fixed top-1/2 left-1/2 max-h-[calc(100vh-150px)] w-max max-w-[min(calc(100%-1rem),var(--container-3xl))] -translate-x-1/2 -translate-y-1/2 transform data-nested-dialog-open:after:haax-backdrop-blur',
							!unstyled && 'haax-surface-3',
							className
						)}
						style={style}
					>
						{children}
					</Base.Popup>
				</Base.Viewport>
			</Base.Portal>
		</Base.Root>
	);
};

export default Dialog;
