'use client';

import { type Control, useController } from 'react-hook-form';
import cls from 'classnames';
import { X } from 'lucide-react';

import { classMask, maskToClass } from '#utils.ts';

import Dialog, { closeDialog } from '../styled/Dialog';
import SpellIcon from '../styled/SpellIcon';
import TextButton from '../styled/TextButton';

type Props = {
	name: string;
	title?: string;
	disabled?: boolean;
	showEmpty?: boolean;
	large?: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control?: Control<any>;
};

const ClassPicker = ({
	name,
	title,
	disabled,
	showEmpty,
	large,
	control
}: Props) => {
	const { field } = useController({ name, control });

	const classInfo = maskToClass(field.value);

	if (disabled && !showEmpty && !classInfo) return null;

	return (
		<Dialog
			trigger={open => (
				<div
					role="button"
					onClick={open}
					onKeyDown={e => e.key === 'Enter' && open()}
					tabIndex={disabled ? -1 : 0}
					className={cls(
						'hocus:haax-highlight flex cursor-pointer items-center gap-2 p-2',
						{ 'pointer-events-none': disabled }
					)}
				>
					<SpellIcon
						icon={classInfo?.icon}
						showDefault
						className={cls('cursor-pointer', large ? 'size-12' : 'size-8')}
					/>
					<span
						className={cls('text-blue-gray', { h2: large })}
						style={{ color: classInfo?.color }}
					>
						{title ? `${title} ` : ''}
						{classInfo?.name ?? 'Any class'}
					</span>
				</div>
			)}
		>
			<div className="flex items-center justify-between gap-2">
				<h3 className="haax-color">Pick Class</h3>

				<TextButton
					icon={X}
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

			<div
				className="grid gap-1"
				style={{ gridTemplateColumns: 'repeat(3, 64px)' }}
			>
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
