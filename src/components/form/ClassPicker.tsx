'use client';

import { useController } from 'react-hook-form';
import cls from 'classnames';
import { X } from 'lucide-react';

import { classMask, maskToClass } from '#utils/index.ts';

import Dialog, { closeDialog } from '../styled/Dialog';
import SpellIcon from '../styled/SpellIcon';
import TextButton from '../styled/TextButton';

type Props = {
	name: string;
	title?: string;
	disabled?: boolean;
	large?: boolean;
};

const ClassPicker = ({ name, title, disabled, large }: Props) => {
	const { field } = useController({ name });
	const classInfo = maskToClass(field.value);
	if (disabled && !classInfo) return null;
	return (
		<Dialog
			trigger={open => (
				<TextButton
					icon={
						<SpellIcon
							icon={classInfo?.icon}
							showDefault
							className={large ? 'size-12' : 'size-8'}
						/>
					}
					disabled={disabled}
					onClick={open}
					className={cls('text-blue-gray', { 'h2 gap-2': large })}
					style={{ color: classInfo?.color }}
				>
					{title ? `${title} ` : ''}
					{classInfo?.name ?? 'Any class'}
				</TextButton>
			)}
		>
			<div className="flex items-center justify-between gap-2">
				<h3 className="haax-color">Pick Class</h3>

				<TextButton
					icon={<X />}
					onClick={e => {
						field.onChange(0);
						closeDialog(e);
					}}
					className="text-red -m-2"
				>
					Clear
				</TextButton>
			</div>

			<hr />

			<div className="grid grid-cols-[repeat(3,64px)] gap-1">
				{Object.entries(classMask).map(([mask, classInfo]) => (
					<SpellIcon
						key={mask}
						icon={classInfo.icon}
						selected={field.value === Number(mask)}
						onClick={e => {
							field.onChange(Number(mask));
							closeDialog(e);
						}}
						className={
							field.value !== Number(mask)
								? 'grayscale hover:grayscale-0'
								: undefined
						}
					/>
				))}
			</div>
		</Dialog>
	);
};

export default ClassPicker;
