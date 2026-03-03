import { type ReactElement } from 'react';

import Dialog, { closeDialog } from './styled/Dialog';
import TextButton from './styled/TextButton';

type Props = {
	title: string;
	confirm: () => void;
	children: (open: () => void) => ReactElement;
};

// TODO: Remove
const ConfirmDialog = ({ title, confirm, children }: Props) => (
	<Dialog trigger={children}>
		<p>{title}</p>
		<hr />
		<div className="-m-3 flex justify-end gap-2">
			<TextButton onClick={closeDialog}>Cancel</TextButton>
			<TextButton
				onClick={e => {
					confirm();
					closeDialog(e);
				}}
			>
				Confirm
			</TextButton>
		</div>
	</Dialog>
);

export default ConfirmDialog;
