import { UseFormRegisterReturn } from 'react-hook-form';

import Button from '../components/Button';
import DialogButton from '../components/DialogButton';
import Icon from '../components/Icon';

import Input from './Input';

type Props = {
	icon?: string;
	inputProps: UseFormRegisterReturn;
};

const IconPicker = ({ icon, inputProps }: Props) => (
	<DialogButton
		dialog={close => (
			<div className="flex gap-4 items-center">
				<Icon icon={icon} />
				<Input {...inputProps} />
				<a
					href="https://www.wowhead.com/icons"
					target="_blank"
					rel="noreferrer"
					className="rounded p-2 hover:underline"
				>
					?
				</a>
				<Button onClick={close}>Ok</Button>
			</div>
		)}
	>
		{open => <Icon icon={icon} showDefault onClick={open} />}
	</DialogButton>
);

export default IconPicker;
