import { type ReactElement } from 'react';

import Button from './components/Button';
import DialogButton from './components/DialogButton';

type Props = {
	title: string;
	confirm: () => void;
	children: (open: () => void) => ReactElement;
};

const ConfirmDialog = ({ title, confirm, children }: Props) => (
	<DialogButton
		dialog={close => (
			<div className="flex flex-col gap-4">
				<h2 className="text-xl font-bold">{title}</h2>
				<div className="flex gap-2">
					<Button dark onClick={close} className="flex-grow">
						Cancel
					</Button>
					<Button
						onClick={() => {
							confirm();
							close();
						}}
						dark
						className="flex-grow"
					>
						Confirm
					</Button>
				</div>
			</div>
		)}
	>
		{children}
	</DialogButton>
);

export default ConfirmDialog;
