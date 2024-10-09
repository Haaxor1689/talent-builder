'use client';

import cls from 'classnames';
import {
	useRef,
	type ReactElement,
	useEffect,
	useCallback,
	useState
} from 'react';
import { createPortal } from 'react-dom';

import ToastProvider from '../ToastProvider';

type Props = {
	clickAway?: boolean;
	noBlur?: boolean;
	focusOnOpen?: boolean;
	afterClose?: () => void;
	dialog: ReactElement | ((close: () => void) => ReactElement);
	children: ReactElement | ((open: () => void) => ReactElement);
};

const DialogButton = ({
	clickAway,
	noBlur,
	focusOnOpen,
	afterClose,
	dialog,
	children
}: Props) => {
	const ref = useRef<HTMLDialogElement>(null);

	const open = useCallback(() => {
		if (!ref.current) return;
		!focusOnOpen && (ref.current.inert = true);
		ref.current.showModal();
		!focusOnOpen && (ref.current.inert = false);
	}, [focusOnOpen]);

	const close = useCallback(() => {
		ref.current?.close();
	}, []);

	// Click away
	useEffect(() => {
		if (!clickAway) return;
		const callback = (e: MouseEvent) => e.target === ref.current && close();
		window.addEventListener('mousedown', callback);
		return () => window.removeEventListener('mousedown', callback);
	}, [clickAway, close]);

	// Disable auto focus after close
	useEffect(() => {
		const callback = () => {
			afterClose?.();
			return (document.activeElement as HTMLElement)?.blur();
		};
		const r = ref.current;
		r?.addEventListener('close', callback);
		return () => r?.removeEventListener('close', callback);
	}, [afterClose]);

	const [mounted, setMounted] = useState<true>();

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<>
			{mounted &&
				createPortal(
					<dialog
						ref={ref}
						className={cls(
							'h-full w-full items-center justify-center bg-[transparent] [&[open]]:flex',
							{ 'backdrop:backdrop-blur-sm': !noBlur }
						)}
					>
						{typeof dialog === 'function' ? dialog(close) : dialog}
						<ToastProvider />
					</dialog>,
					document.body
				)}
			{typeof children === 'function' ? children(open) : children}
		</>
	);
};

export default DialogButton;
