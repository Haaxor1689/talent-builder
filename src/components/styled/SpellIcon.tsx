import cls from 'classnames';

import { getIconPath } from '#utils.ts';

type Props = React.DetailedHTMLProps<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
> & {
	clickable?: boolean;
	icon?: string | null;
	value?: number;
	ranks?: number | null;
	frameClass?: string;
	showDefault?: boolean;
	showEmpty?: boolean;
	selected?: boolean;
	highlighted?: boolean;
	size?: number;
};
const SpellIcon = ({
	ref,
	icon,
	value,
	ranks,
	showDefault,
	selected,
	highlighted,
	frameClass,
	className,
	clickable,
	size = 64,
	...props
}: Props & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
	const isClickable = !!clickable || !!props.onClick;
	return (
		<button
			ref={ref}
			type="button"
			tabIndex={!isClickable ? -1 : undefined}
			className={cls(
				'cursor group/icon relative focus:outline-none',
				!isClickable ? 'cursor-default' : 'cursor-pointer',
				selected && 'haax-highlight',
				className
			)}
			{...props}
		>
			{showDefault || icon ? (
				<img
					src={getIconPath(icon ?? undefined)}
					alt={!icon || icon === '' ? 'empty' : icon}
					width={size}
					height={size}
				/>
			) : (
				<img
					src="/icon_frame.png"
					alt="frame"
					width={size}
					height={size}
					className={frameClass}
				/>
			)}

			<img
				className={cls('pointer-events-none absolute inset-0 hidden p-[5%]', {
					'group-hover/icon:block group-focus/icon:block': isClickable
				})}
				src="/icon_hover.png"
				alt="hover"
				width={size}
				height={size}
			/>

			{highlighted && (
				<span className="text-pink h2 pointer-events-none absolute -top-3 -right-2.5 animate-pulse">
					!!
				</span>
			)}

			{!!ranks && (
				<p
					className={cls(
						'bg-dark-gray absolute right-1 bottom-1 translate-x-1/2 translate-y-1/2 rounded border-0 px-1',
						{
							'text-green': value !== undefined && ranks !== value,
							'text-yellow': value !== undefined && ranks === value
						}
					)}
				>
					{value !== undefined ? `${value}/` : ''}
					{ranks}
				</p>
			)}
		</button>
	);
};

export default SpellIcon;
