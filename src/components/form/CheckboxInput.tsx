import { type ReactNode } from 'react';
import { useController } from 'react-hook-form';
import cls from 'classnames';

import TextButton from '../styled/TextButton';

export const Checkbox = ({checked}: {checked?: boolean}) => (
	<svg
		viewBox="0 0 12 12"
		xmlns="http://www.w3.org/2000/svg"
		className='size-4'
	>
		<rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" />
		<rect x="3.5" y="3.5" width="5" height="5" fill={checked ?"white" : 'none'} />
	</svg>
);

type Props = {
	name: string;
	label?: ReactNode;
	disabled?: boolean;
	className?: string;
};

const CheckboxInput = ({ name, label, disabled, className }: Props) => {
	const { field } = useController({ name, defaultValue: false });

	return (
		<TextButton
			onClick={() => {
				if (disabled) return;
				field.onChange(!field.value);
			}}
			icon={<Checkbox checked={field.value} />}
			disabled={disabled}
			className={cls(
				'text-blue-gray',
				className
			)}
		>
			{label}
		</TextButton>
	);
};

export default CheckboxInput;
