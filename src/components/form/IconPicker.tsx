'use client';

import { useEffect, useRef, useState } from 'react';
import { useController } from 'react-hook-form';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Check, Filter } from 'lucide-react';

import ScrollArea from '#components/styled/ScrollArea.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import useDebounced from '#hooks/useDebounced.ts';
import { iconList } from '#utils/index.ts';

import Dialog, { closeDialog } from '../styled/Dialog';
import SpellIcon from '../styled/SpellIcon';
import Input from './Input';

type Props = { name: string; disabled?: boolean };

const ICON_SIZE = 64;
const GAP = 4;
const ITEM_SIZE = ICON_SIZE + GAP;
const MAX_COLS = 10;
const MIN_COLS = 3;

const calculateCols = () => {
	if (typeof window === 'undefined') return MIN_COLS;
	const maxWidth = window.innerWidth - 32;
	const availableCols = Math.floor((maxWidth - 24) / ITEM_SIZE);
	return Math.min(MAX_COLS, Math.max(MIN_COLS, availableCols));
};

const IconPicker = ({ name, disabled }: Props) => {
	const { field } = useController({ name });
	const parentRef = useRef<HTMLDivElement>(null);
	const [cols, setCols] = useState(calculateCols);

	const [value, setValue] = useState(
		field.value.startsWith('_') || field.value === 'inv_misc_questionmark'
			? ''
			: field.value.toLowerCase()
	);

	const [filter, setFilter] = useState('');
	const debouncedFilter = useDebounced(filter);
	const filteredIcons = Object.keys(iconList)
		.filter(icon => icon.includes(debouncedFilter.toLocaleLowerCase()))
		.sort();

	// eslint-disable-next-line react-hooks/incompatible-library
	const virtualizer = useVirtualizer({
		count: Math.ceil(filteredIcons.length / cols),
		getScrollElement: () => parentRef.current,
		estimateSize: () => ITEM_SIZE,
		overscan: 2
	});

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const updateCols = () => {
			setCols(calculateCols());
			virtualizer.measure();
		};
		window.addEventListener('resize', updateCols);
		return () => window.removeEventListener('resize', updateCols);
	}, [virtualizer]);

	return (
		<Dialog
			trigger={open => (
				<SpellIcon
					icon={field.value}
					disabled={disabled}
					showDefault
					onClick={open}
				/>
			)}
			onOpenChange={open => open && setTimeout(() => virtualizer.measure(), 0)}
			style={{ width: `${cols * ICON_SIZE + (cols - 1) * GAP + 24}px` }}
		>
			<h2 className="haax-color">Select an icon</h2>

			<hr />

			<div className="flex flex-wrap items-center justify-center gap-2">
				<SpellIcon icon={value} />
				<Input
					value={value}
					onChange={e => setValue(e.target.value)}
					className="grow"
				/>
				<TextButton
					icon={<Check />}
					onClick={e => {
						field.onChange(value);
						closeDialog(e);
					}}
					className="text-warm-green"
				>
					Confirm
				</TextButton>
			</div>

			<p className="text-blue-gray -mb-2">Supported icon sources:</p>
			<ul className="list-disc pl-5">
				<li className="text-blue-gray">
					Pick an icon from the list of available icons below.
				</li>
				<li className="text-blue-gray">
					Browse the icon list on{' '}
					<TextButton
						icon={
							<img
								src="https://wow.zamimg.com/images/logos/favicon-live.png"
								alt="Wowhead logo"
								className="mr-1.5 inline size-5"
							/>
						}
						type="link"
						href="https://www.wowhead.com/icons"
						external
						className="-m-2 inline-block"
					>
						Wowhead
					</TextButton>{' '}
					and copy the icon names here.
				</li>
				<li className="text-blue-gray">
					Use a completely custom image by providing a <span>external URL</span>{' '}
					to the image. A WoW icon border will be automatically added.
				</li>
			</ul>

			<hr />
			<div className="-my-2 flex items-center justify-between gap-3">
				<h3 className="hidden grow sm:inline">Available icons</h3>
				<Input
					value={filter}
					placeholder="Filter..."
					onChange={e => setFilter(e.target.value)}
					after={<Filter className="text-blue-gray" />}
					className="shrink grow"
				/>
			</div>
			<hr />

			<ScrollArea
				ref={parentRef}
				containerClassName="h-100 -m-3"
				contentClassName="p-3 min-h-100"
			>
				<div
					className="relative w-full"
					style={{ height: `${virtualizer.getTotalSize()}px` }}
				>
					{virtualizer.getVirtualItems().map(virtualRow => (
						<div
							key={virtualRow.key}
							className="absolute top-0 left-0 flex w-full gap-1"
							style={{ transform: `translateY(${virtualRow.start}px)` }}
						>
							{Array.from({ length: cols }).map((_, colIndex) => {
								const iconIndex = virtualRow.index * cols + colIndex;
								const icon = filteredIcons[iconIndex];
								return icon ? (
									<SpellIcon
										key={icon}
										icon={icon}
										selected={icon === value}
										onClick={() => setValue(icon)}
									/>
								) : (
									<div key={colIndex} className="size-16" />
								);
							})}
						</div>
					))}
				</div>
			</ScrollArea>
		</Dialog>
	);
};

export default IconPicker;
