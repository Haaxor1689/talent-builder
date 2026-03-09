'use client';

import { useState } from 'react';
import { useController } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { HelpCircle, ListFilter } from 'lucide-react';

import useDebounced from '#hooks/useDebounced.ts';

import Dialog, { closeDialog } from '../styled/Dialog';
import IconGrid from '../styled/IconGrid';
import SpellIcon from '../styled/SpellIcon';
import Input from './Input';

type Props = { name: string; disabled?: boolean };

const IconPicker = ({ name, disabled }: Props) => {
	const query = useQuery({
		queryKey: ['icons'],
		queryFn: async () => {
			const response = await fetch('/icons/list.json');
			const data: [number, string][] = await response.json();
			if (!data || !Array.isArray(data))
				throw new Error('Failed to fetch icons');
			return data;
		},
		enabled: !disabled
	});

	const { field } = useController({ name });

	const [filter, setFilter] = useState(
		field.value.startsWith('_') || field.value === 'inv_misc_questionmark'
			? ''
			: field.value.toLowerCase()
	);
	const [wowhead, setWowhead] = useState(
		field.value.startsWith('_') ? field.value.slice(1) : ''
	);

	const debouncedFilter = useDebounced(filter);

	const item = query.data?.find(([, i]) => i === field.value);

	return (
		<Dialog
			trigger={open => (
				<SpellIcon
					icon={field.value}
					disabled={disabled}
					showDefault
					title={
						item ? `#${item[0]} ${item[1]}` : `#wowhead ${field.value.slice(1)}`
					}
					onClick={open}
				/>
			)}
			unstyled
			className="haax-surface-0 w-full max-w-[calc(10*64px+9*4px+26px)]"
		>
			<div className="flex items-center justify-between gap-4 p-3">
				<h3 className="haax-color">Pick icon</h3>
				<Input
					value={filter}
					icon={ListFilter}
					onChange={e => setFilter((e.target as HTMLInputElement).value)}
					className="grow"
				/>
			</div>

			<hr />

			<IconGrid
				filter={debouncedFilter}
				icon={field.value}
				setIcon={(icon, e) => {
					field.onChange(icon);
					setWowhead('');
					closeDialog(e);
				}}
			/>

			<hr />

			<form
				className="flex items-center gap-2 p-3"
				onSubmit={e => {
					field.onChange(wowhead);
					setWowhead('');
					closeDialog(e);
				}}
			>
				<label htmlFor="wowhead">Wowhead icon:</label>
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
						closeDialog(e);
						return false;
					}}
					icon={HelpCircle}
					onIconClick={() => {
						// Open wowhead in new tab
						window.open('https://wowhead.com/icons/');
					}}
					className="grow"
				/>
			</form>
		</Dialog>
	);
};

export default IconPicker;
