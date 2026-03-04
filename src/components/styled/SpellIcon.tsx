import { type HTMLAttributes } from 'react';
import cls from 'classnames';

import { getIconPath } from '#utils.ts';

type Props = HTMLAttributes<HTMLButtonElement> & {
	icon?: string | null;
	currentRank?: number;
	ranks?: number | null;
	frameClass?: string;
	showDefault?: boolean;
	showEmpty?: boolean;
	selected?: boolean;
	highlighted?: boolean;
	disabled?: boolean;
	size?: number;
	className?: cls.Value;
	extraContent?: React.ReactNode;
};

const SpellIcon = ({
	icon,
	currentRank,
	ranks,
	showDefault,
	selected,
	highlighted,
	frameClass,
	className,
	disabled,
	size = 64,
	extraContent,
	...props
}: Props) => {
	const isClickable = props.onClick && !disabled;
	return (
		<button
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

			{extraContent}
			{!!ranks && (
				<p
					className={cls(
						'bg-dark-gray absolute right-1 bottom-1 translate-x-1/2 translate-y-1/2 rounded border-0 px-1',
						{
							'text-green': currentRank !== undefined && ranks !== currentRank,
							'text-yellow': currentRank !== undefined && ranks === currentRank
						}
					)}
				>
					{currentRank !== undefined ? `${currentRank}/` : undefined}
					{ranks}
				</p>
			)}
		</button>
	);
};

export default SpellIcon;
