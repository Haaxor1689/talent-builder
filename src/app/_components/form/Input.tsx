import cls from 'classnames';
import { type LucideIcon } from 'lucide-react';
import { type HTMLProps, forwardRef } from 'react';

type Props = HTMLProps<HTMLInputElement> & {
	label?: string;
	error?: boolean;
	icon?: LucideIcon;
	onIconClick?: () => void;
};

const Input = forwardRef<HTMLInputElement, Props>(
	(
		{
			label,
			name,
			id = name,
			className,
			error,
			icon: Icon,
			onIconClick,
			...props
		},
		ref
	) => (
		<div className={cls('flex flex-col gap-2', className)}>
			{label && <label htmlFor={id}>{label}</label>}
			<div className="relative flex items-center">
				<input
					ref={ref}
					id={id}
					name={name}
					{...props}
					className={cls('tw-input-underline', {
						'tw-input-error': error,
						'pr-9': !!Icon
					})}
				/>
				{Icon && (
					<Icon
						role={onIconClick ? 'button' : undefined}
						tabIndex={onIconClick ? 0 : undefined}
						onClick={onIconClick}
						className={cls(
							'absolute right-2 text-blueGray',
							onIconClick ? 'hocus:text-white' : 'pointer-events-none'
						)}
					/>
				)}
			</div>
		</div>
	)
);

export default Input;
