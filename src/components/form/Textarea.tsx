'use client';

import { type ComponentProps } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import cls from 'classnames';

type Props = ComponentProps<typeof TextareaAutosize> & {
	label?: string;
	error?: boolean;
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
}: Props & { ref?: React.RefObject<HTMLTextAreaElement | null> }) => (
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
			className={cls('haax-input-underline', {
				'haax-input-hocus': !props.disabled,
				'haax-input-error': error
			})}
		/>
	</div>
);

export default Textarea;
