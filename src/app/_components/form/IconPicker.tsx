'use client';

import { useState } from 'react';
import { HelpCircle, ListFilter } from 'lucide-react';
import { useController } from 'react-hook-form';

import DialogButton from '../styled/DialogButton';
import TalentIcon from '../styled/TalentIcon';
import useDebounced from '../hooks/useDebounced';

import Input from './Input';
import IconGrid from './IconGrid';

type Props = {
	name: string;
	disabled?: boolean;
	required?: boolean;
};

const IconPicker = ({ name, required, disabled }: Props) => {
	const [filter, setFilter] = useState('');
	const [wowhead, setWowhead] = useState('');

	const debouncedFilter = useDebounced(filter);

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
							onChange={e => setFilter((e.target as HTMLInputElement).value)}
						/>
					</div>

					<IconGrid
						filter={debouncedFilter}
						required={required}
						icon={field.value}
						setIcon={i => {
							field.onChange(i);
							setWowhead('');
							close();
						}}
					/>

					<form
						className="flex items-center gap-2"
						onSubmit={() => {
							field.onChange(wowhead);
							setWowhead('');
							close();
						}}
					>
						<label htmlFor="wowhead" className="shrink-0">
							Wowhead icon:
						</label>
						<Input
							name="wowhead"
							value={wowhead}
							onChange={e => setWowhead((e.target as HTMLInputElement).value)}
							icon={HelpCircle}
							onIconClick={() => {
								// Open wowhead in new tab
								window.open('https://wowhead.com/icons/');
							}}
							className="w-full"
						/>
					</form>
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
