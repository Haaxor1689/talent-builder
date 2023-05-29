import cls from 'classnames';
import { forwardRef } from 'react';

type Props = Omit<
	React.DetailedHTMLProps<
		React.InputHTMLAttributes<HTMLInputElement>,
		HTMLInputElement
	>,
	'type'
> & {
	name: string;
	label: string;
};

const Checkbox = forwardRef<HTMLInputElement, Props>(
	({ label, name, id = name, className, ...props }, ref) => (
		<div className={cls('flex gap-2 w-full p-3', className)}>
			<input
				ref={ref}
				id={id}
				name={name}
				type="checkbox"
				className="rounded  bg-zinc-700 "
				{...props}
			/>
			<label htmlFor={id}>{label}</label>
		</div>
	)
);

export default Checkbox;
