import { type ReactElement } from 'react';

import DialogButton from './styled/DialogButton';
import TextButton from './styled/TextButton';

type Props = {
	title: string;
	confirm: () => void;
	children: (open: () => void) => ReactElement;
};

const ConfirmDialog = ({ title, confirm, children }: Props) => (
	<DialogButton
		dialog={close => (
			<div className="tw-surface flex flex-col gap-4 bg-darkGray/90">
				<p>{title}</p>
				<div className="-m-2 flex justify-end gap-2">
					<TextButton onClick={close}>Cancel</TextButton>
					<TextButton
						onClick={() => {
							confirm();
							close();
						}}
					>
						Confirm
					</TextButton>
				</div>
			</div>
		)}
		clickAway
	>
		{children}
	</DialogButton>
);

export default ConfirmDialog;
