'use client';

import { type HTMLProps } from 'react';
import cls from 'classnames';
import { type LucideIcon } from 'lucide-react';

type Props = HTMLProps<HTMLInputElement> & {
	ref?: React.Ref<HTMLInputElement>;
	label?: string;
	error?: boolean;
	icon?: LucideIcon;
	onIconClick?: () => void;
	inputClassName?: cls.Value;
};

const Input = ({
	ref,
	label,
	name,
	id = name,
	className,
	error,
	icon: Icon,
	onIconClick,
	inputClassName,
	...props
}: Props) => (
	<div className={cls('flex flex-col gap-2', className)}>
		{label && <label htmlFor={id}>{label}</label>}
		<div className="relative flex items-center">
			<input
				ref={ref}
				id={id}
				name={name}
				{...props}
				onKeyDown={e => {
					if (e.key.toLocaleLowerCase() === 'z' && e.ctrlKey) {
						e.preventDefault();
					}
				}}
				className={cls('haax-input-underline shrink', inputClassName, {
					'haax-input-hocus': !props.disabled,
					'haax-input-error': error,
					'pr-9': !!Icon
				})}
			/>
			{Icon && (
				<Icon
					role={onIconClick ? 'button' : undefined}
					tabIndex={onIconClick ? 0 : undefined}
					onClick={onIconClick}
					className={cls(
						'text-blue-gray absolute right-2',
						onIconClick ? 'hocus:text-white' : 'pointer-events-none'
					)}
				/>
			)}
		</div>
	</div>
);

export default Input;
