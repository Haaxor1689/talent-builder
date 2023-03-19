import cls from 'classnames';
import { forwardRef } from 'react';

type Props = React.DetailedHTMLProps<
	React.TextareaHTMLAttributes<HTMLTextAreaElement>,
	HTMLTextAreaElement
> & {
	name: string;
	label?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
	({ label, name, id = name, className, ...props }, ref) => (
		<div className="flex flex-col gap-2 flex-grow">
			{label && <label htmlFor={id}>{label}</label>}
			<textarea
				ref={ref}
				id={id}
				name={name}
				className={cls(
					'rounded p-3 flex-grow text-zinc-200 bg-zinc-700',
					className
				)}
				{...props}
			/>
		</div>
	)
);

export default Textarea;
