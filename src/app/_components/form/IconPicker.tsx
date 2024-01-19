import { useState } from 'react';
import { ListFilter } from 'lucide-react';
import { useController } from 'react-hook-form';

import DialogButton from '../styled/DialogButton';
import TalentIcon from '../TalentIcon';

import Input from './Input';
import IconGrid from './IconGrid';

type Props = {
	name: string;
	disabled?: boolean;
	required?: boolean;
};

const IconPicker = ({ name, required, disabled }: Props) => {
	const [filter, setFilter] = useState('');
	const { field } = useController({ name });
	return (
		<DialogButton
			dialog={close => (
				<div className="tw-surface flex flex-col gap-2 bg-darkGray/90">
					<div className="flex items-center justify-between gap-4">
						<h3 className="tw-color">Pick icon</h3>
						<Input
							value={filter}
							icon={ListFilter}
							onChange={e => setFilter(e.target.value)}
						/>
					</div>

					<IconGrid
						filter={filter}
						required={required}
						icon={field.value}
						setIcon={i => {
							field.onChange(i);
							close();
						}}
					/>
				</div>
			)}
			clickAway
		>
			{open => (
				<TalentIcon
					icon={field.value}
					showDefault
					onClick={!disabled ? open : undefined}
				/>
			)}
		</DialogButton>
	);
};

export default IconPicker;
