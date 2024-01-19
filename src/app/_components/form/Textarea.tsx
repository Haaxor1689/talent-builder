'use client';

import TextareaAutosize from 'react-textarea-autosize';
import cls from 'classnames';
import { type HTMLProps, forwardRef, useEffect, useState } from 'react';

type Props = HTMLProps<HTMLTextAreaElement> & {
	label?: string;
	error?: boolean;
	minRows?: number;
};

const Input = forwardRef<HTMLTextAreaElement, Props>(
	({ label, name, id = name, className, error, ...props }, ref) => (
		<div className={cls('flex flex-col gap-2', className)}>
			{label && <label htmlFor={id}>{label}</label>}
			<TextareaAutosize
				ref={ref as any}
				id={id}
				name={name}
				{...(props as any)}
				className={cls('tw-input-underline', { 'tw-input-error': error })}
			/>
		</div>
	)
);

export default Input;
