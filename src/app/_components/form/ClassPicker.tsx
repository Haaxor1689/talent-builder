'use client';

import { useController } from 'react-hook-form';
import cls from 'classnames';
import { X } from 'lucide-react';

import DialogButton from '../styled/DialogButton';
import TalentIcon from '../builder/TalentIcon';
import { classMask, maskToClass } from '../hooks/utils';
import TextButton from '../styled/TextButton';

type Props = {
	name: string;
	disabled?: boolean;
};

const ClassPicker = ({ name, disabled }: Props) => {
	const { field } = useController({ name });

	const classInfo = maskToClass(field.value);

	if (disabled && !classInfo) return null;

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
							<TalentIcon
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
						'tw-hocus flex items-center gap-2 self-center p-2 text-blueGray',
						{ 'pointer-events-none': disabled }
					)}
				>
					<TalentIcon
						icon={classInfo?.icon ?? 'inv_misc_questionmark'}
						className="size-8 cursor-pointer"
					/>
					<span className="text-[inherit]" style={{ color: classInfo?.color }}>
						{classInfo?.name ?? 'Any class'}
					</span>
				</div>
			)}
		</DialogButton>
	);
};

export default ClassPicker;
