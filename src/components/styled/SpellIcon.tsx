import { type HTMLAttributes } from 'react';
import cls from 'classnames';

import { getIconPath } from '#utils/index.ts';

type Props = HTMLAttributes<HTMLElement> & {
	icon?: string | null;
	currentRank?: number;
	ranks?: number | null;
	showDefault?: boolean;
	showEmpty?: boolean;
	selected?: boolean;
	disabled?: boolean;
	className?: string;
	extraContent?: React.ReactNode;
};

const SpellIcon = ({
	icon,
	currentRank,
	ranks,
	showDefault,
	selected,
	className,
	disabled,
	extraContent,
	...props
}: Props) => {
	const isClickable = props.onClick && !disabled;
	const Component = props.onClick ? 'button' : 'div';
	return (
		<Component
			{...(props.onClick ? { ...props, type: 'button', disabled } : {})}
			className={cls(
				'cursor group/icon relative size-(--spell-icon-size) focus:outline-none',
				isClickable ? 'cursor-pointer' : 'cursor-[inherit]',
				selected && 'haax-highlight',
				className
			)}
		>
			{showDefault || !!icon ? (
				<img
					src={getIconPath(icon ?? undefined)}
					alt={!icon || icon === '' ? 'empty' : icon}
					className="size-full"
				/>
			) : (
				<img src="/icon_frame.png" alt="frame" className="size-full" />
			)}

			{isClickable && (
				<img
					src="/icon_hover.png"
					alt="hover"
					className="pointer-events-none absolute inset-0 hidden size-full p-[5%] group-hover/icon:block group-focus/icon:block"
				/>
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
		</Component>
	);
};

export default SpellIcon;
