'use client';

import { type Control, useController } from 'react-hook-form';
import cls from 'classnames';
import { X } from 'lucide-react';

import { maskToClass, classMask } from '~/utils';

import DialogButton from '../styled/DialogButton';
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
		<DialogButton
			dialog={close => (
				<div className="tw-surface flex flex-col gap-2 bg-darkGray/90">
					<div className="flex items-center justify-between gap-4">
						<h3 className="tw-color">Pick Class</h3>
					</div>

					<div
						className="grid gap-1"
						style={{ gridTemplateColumns: 'repeat(3, 64px)' }}
					>
						{Object.entries(classMask).map(([mask, classInfo]) => (
							<SpellIcon
								key={mask}
								icon={classInfo.icon}
								selected={field.value === Number(mask)}
								onClick={() => {
									field.onChange(Number(mask));
									close();
								}}
								className={
									field.value !== Number(mask)
										? 'grayscale hover:grayscale-0'
										: undefined
								}
							/>
						))}
					</div>
					<TextButton
						icon={X}
						onClick={() => {
							field.onChange(0);
							close();
						}}
						className="-m-1"
					>
						Clear
					</TextButton>
				</div>
			)}
			clickAway
		>
			{open => (
				<div
					role="button"
					onClick={open}
					onKeyDown={e => e.key === 'Enter' && open()}
					tabIndex={disabled ? -1 : 0}
					className={cls(
						'tw-hocus flex shrink-0 items-center gap-2 p-2 text-blueGray',
						{
							'pointer-events-none': disabled
						}
					)}
				>
					<SpellIcon
						icon={classInfo?.icon}
						showDefault
						className={cls('cursor-pointer', large ? 'size-12' : 'size-8')}
					/>
					<span
						className={cls('text-[inherit]', { h3: large })}
						style={{ color: classInfo?.color }}
					>
						{title ? `${title} ` : ''}
						{classInfo?.name ?? 'Any class'}
					</span>
				</div>
			)}
		</DialogButton>
	);
};

export default ClassPicker;
