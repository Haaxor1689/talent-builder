'use client';

import { type HTMLProps, type ReactNode, useId } from 'react';
import cls from 'classnames';

type Props = HTMLProps<HTMLInputElement> & {
	ref?: React.Ref<HTMLInputElement>;
	label?: string;
	error?: boolean;
	hint?: string;
	before?: ReactNode;
	after?: ReactNode;
};

const Input = ({
	ref,
	label,
	name,
	id = name,
	className,
	error,
	hint,
	before,
	after,
	...props
}: Props) => {
	const customId = useId();
	return (
		<div className={cls('flex flex-col gap-2', className)}>
			{label && <label htmlFor={id ?? customId}>{label}</label>}
			<label
				htmlFor={id ?? customId}
				className={cls('flex shrink haax-input-underline items-center gap-2', {
					'haax-input-hocus': !props.disabled,
					'haax-input-error': !!error
				})}
			>
				{before}
				<input
					ref={ref}
					id={id ?? customId}
					name={name}
					{...props}
					onKeyDown={e => {
						if (e.key === 'Enter') e.preventDefault();

						if (e.key.toLocaleLowerCase() === 'y' && e.ctrlKey)
							e.preventDefault();

						if (e.key.toLocaleLowerCase() === 'z' && e.ctrlKey)
							e.preventDefault();
					}}
					className="w-0 shrink grow"
				/>
				{after}
			</label>
			{error ? (
				<p className="text-sm text-red">{error}</p>
			) : hint ? (
				<p className="text-sm text-blue-gray">{hint}</p>
			) : null}
		</div>
	);
};

export default Input;
