/* eslint-disable @next/next/no-img-element */
import cls from 'classnames';
import { forwardRef } from 'react';

import { getIconPath } from '~/utils';

import TalentArrow from './TalentArrow';

type Props = React.DetailedHTMLProps<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
> & {
	clickable?: boolean;
	icon?: string | null;
	value?: number;
	ranks?: number | null;
	arrow?: [number, number] | null;
	highlightedArrow?: boolean;
	frameClass?: string;
	showDefault?: boolean;
	selected?: boolean;
	highlighted?: boolean;
	size?: number;
};

const SpellIcon = forwardRef<HTMLButtonElement, Props>(
	(
		{
			icon,
			value,
			ranks,
			arrow,
			highlightedArrow,
			showDefault,
			selected,
			highlighted,
			frameClass,
			className,
			clickable,
			size = 64,
			...props
		},
		ref
	) => {
		const isClickable = !!clickable || !!props.onClick;
		return (
			<button
				ref={ref}
				type="button"
				tabIndex={!isClickable ? -1 : undefined}
				className={cls(
					'cursor group relative flex-shrink-0 focus:outline-none',
					!isClickable ? 'cursor-default' : 'cursor-pointer',
					className
				)}
				{...props}
			>
				{showDefault || icon ? (
					<img
						src={getIconPath(icon ?? undefined)}
						alt={!icon ? 'empty' : icon}
						width={size}
						height={size}
					/>
				) : (
					<img
						src="/icon_frame.png"
						alt="frame"
						width={size}
						height={size}
						className={cls('absolute inset-0', frameClass)}
					/>
				)}
				<img
					className={cls('absolute inset-0 p-[5%]', {
						'group-hover:block group-focus:block': isClickable,
						'hidden': !selected,
						'hue-rotate-180': selected
					})}
					src="/icon_hover.png"
					alt="hover"
					width={size}
					height={size}
				/>

				{highlighted && (
					<img
						className={cls('absolute inset-0 scale-125 ')}
						src="/icon_hover.png"
						alt="hover"
						width={size}
						height={size}
					/>
				)}

				{!!ranks && (
					<p
						className={cls(
							'absolute bottom-1 right-1 translate-x-1/2 translate-y-1/2 rounded border-0 bg-darkGray px-1',
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

				{!!arrow && (
					<TalentArrow
						start={arrow[0]}
						end={arrow[1]}
						highlighted={highlightedArrow}
					/>
				)}
			</button>
		);
	}
);

export default SpellIcon;
