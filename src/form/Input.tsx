import cls from 'classnames';
import { forwardRef } from 'react';

type Props = React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
> & {
	name: string;
	label?: string;
};

const Input = forwardRef<HTMLInputElement, Props>(
	({ label, name, id = name, className, ...props }, ref) => (
		<div className={cls('flex flex-col gap-2', className)}>
			{label && <label htmlFor={id}>{label}</label>}
			<input
				ref={ref}
				id={id}
				name={name}
				className="rounded p-3 text-zinc-200 bg-zinc-700 w-full"
				{...props}
			/>
		</div>
	)
);

export default Input;
