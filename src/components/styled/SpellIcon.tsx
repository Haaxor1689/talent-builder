import cls from 'classnames';
import { type HTMLAttributes } from 'react';

import { getIconPath } from '#utils/index.ts';

type Props = HTMLAttributes<HTMLElement> & {
	icon?: string | null;
	fallbackIcon?: string;
	currentRank?: number;
	ranks?: number | null;
	showDefault?: boolean;
	selected?: boolean;
	disabled?: boolean;
	className?: string;
	extraContent?: React.ReactNode;
};

const SpellIcon = ({
	icon,
	fallbackIcon = getIconPath(null),
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
				'cursor group/icon relative flex size-(--spell-icon-size) items-center justify-center focus:outline-none',
				isClickable ? 'cursor-pointer' : 'cursor-[inherit]',
				selected && 'haax-highlight',
				className
			)}
		>
			{(!!showDefault || !!icon) && (
				<img
					src={getIconPath(icon)}
					alt={`${icon ?? 'empty'} icon`}
					onError={e => {
						if (fallbackIcon) e.currentTarget.src = fallbackIcon;
					}}
					className="size-[87.5%] object-contain"
				/>
			)}
			<img
				src="/icon_frame.png"
				alt="frame"
				className="absolute inset-0 size-full [image-rendering:pixelated]"
			/>

			{isClickable && (
				<img
					src="/icon_hover.png"
					alt="hover"
					className="pointer-events-none absolute inset-0 hidden size-full p-[5%] [image-rendering:pixelated] group-hover/icon:block group-focus/icon:block"
				/>
			)}

			{extraContent}
			{!!ranks && (
				<p
					className={cls(
						'absolute right-1 bottom-1 translate-x-1/2 translate-y-1/2 rounded border-0 bg-dark-gray px-1',
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
