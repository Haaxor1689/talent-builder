import { createRef, ReactElement } from 'react';

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
			<dialog
				ref={ref}
				className="rounded bg-zinc-800 text-zinc-200 border border-zinc-600"
			>
				{dialog(close)}
			</dialog>
			{children(open)}
		</>
	);
};

export default DialogButton;
