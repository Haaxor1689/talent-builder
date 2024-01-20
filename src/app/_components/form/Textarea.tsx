'use client';

import cls from 'classnames';
import { forwardRef, type ComponentProps } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

type Props = ComponentProps<typeof TextareaAutosize> & {
	label?: string;
	error?: boolean;
	minRows?: number;
};

const Input = forwardRef<HTMLTextAreaElement, Props>(
	({ label, name, id = name, className, error, ...props }, ref) => (
		<div className={cls('flex flex-col gap-2', className)}>
			{label && <label htmlFor={id}>{label}</label>}
			<TextareaAutosize
				ref={ref}
				id={id}
				name={name}
				{...props}
				className={cls('tw-input-underline', { 'tw-input-error': error })}
			/>
		</div>
	)
);

export default Input;
