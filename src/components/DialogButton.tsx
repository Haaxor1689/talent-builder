/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { createRef, type ReactElement } from 'react';
import { createPortal } from 'react-dom';

type Props = {
	dialog: (close: () => void) => ReactElement;
	children: (open: () => void) => ReactElement;
};

const DialogButton = ({ dialog, children }: Props) => {
	const ref = createRef<HTMLDialogElement>();
	const open = () => ref.current?.showModal();
	const close = () => ref.current?.close();
	return (
		<>
			{createPortal(
				<dialog
					ref={ref}
					onClick={e => e.target === ref.current && close()}
					className="rounded bg-zinc-900 text-zinc-400 backdrop:backdrop-blur-sm"
				>
					{dialog(close)}
				</dialog>,
				document.body
			)}
			{children(open)}
		</>
	);
};

export default DialogButton;
