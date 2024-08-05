'use client';

import { useState } from 'react';
import { HelpCircle, ListFilter } from 'lucide-react';
import { useController } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';

import useDebounced from '~/hooks/useDebounced';

import DialogButton from '../styled/DialogButton';
import SpellIcon from '../styled/SpellIcon';
import IconGrid from '../styled/IconGrid';

import Input from './Input';

type Props = {
	name: string;
	disabled?: boolean;
	required?: boolean;
};

const IconPicker = ({ name, required, disabled }: Props) => {
	const query = useQuery({
		queryKey: ['icons'],
		queryFn: async () => {
			const response = await fetch('/icons/list.json');
			const data: [number, string][] = await response.json();
			if (!data || !Array.isArray(data))
				throw new Error('Failed to fetch icons');
			return data;
		}
	});

	const { field } = useController({ name });

	const [filter, setFilter] = useState(
		field.value.startsWith('_') ? '' : field.value.toLowerCase()
	);
	const [wowhead, setWowhead] = useState(
		field.value.startsWith('_') ? field.value.slice(1) : ''
	);

	const debouncedFilter = useDebounced(filter);

	const item = query.data?.find(([, i]) => i === field.value);

	return (
		<DialogButton
			dialog={close => (
				<div className="tw-surface flex w-full max-w-[574px] flex-col gap-2 bg-darkGray/90">
					<div className="flex items-center justify-between gap-4">
						<h3 className="tw-color">Pick icon</h3>
						<Input
							value={filter}
							icon={ListFilter}
							onChange={e => setFilter((e.target as HTMLInputElement).value)}
							className="grow"
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
							onKeyDownCapture={e => {
								if (e.key !== 'Enter') return;
								e.preventDefault();
								e.stopPropagation();

								field.onChange(`_${wowhead}`);
								setWowhead('');
								close();
								return false;
							}}
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
				<SpellIcon
					icon={field.value}
					showDefault
					onClick={!disabled ? open : undefined}
					title={
						item ? `#${item[0]} ${item[1]}` : `#wowhead ${field.value.slice(1)}`
					}
				/>
			)}
		</DialogButton>
	);
};

export default IconPicker;
