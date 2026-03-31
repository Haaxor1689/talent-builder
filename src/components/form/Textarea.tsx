'use client';

import cls from 'classnames';
import { type ComponentProps } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

type Props = ComponentProps<typeof TextareaAutosize> & {
	ref?: React.Ref<HTMLTextAreaElement>;
	label?: string;
	error?: string;
	minRows?: number;
};

const Textarea = ({
	ref,
	label,
	name,
	id = name,
	className,
	error,
	...props
}: Props) => (
	<div className={cls('flex flex-col gap-2', className)}>
		{label && <label htmlFor={id}>{label}</label>}
		<TextareaAutosize
			ref={ref}
			id={id}
			name={name}
			onKeyDown={e => {
				if (e.key.toLocaleLowerCase() === 'z' && e.ctrlKey) {
					e.preventDefault();
				}
			}}
			{...props}
			className={cls('shrink haax-input-underline grow', {
				'haax-input-hocus': !props.disabled,
				'haax-input-error': error
			})}
		/>
		{error && <p className="text-sm text-red">{error}</p>}
	</div>
);

export default Textarea;
