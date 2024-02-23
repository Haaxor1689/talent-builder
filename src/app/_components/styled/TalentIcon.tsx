import cls from 'classnames';
import { forwardRef } from 'react';
import Image from 'next/image';

import TalentArrow from './TalentArrow';

type Props = React.DetailedHTMLProps<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
> & {
	clickable?: boolean;
	icon: string;
	value?: number;
	ranks?: number | null;
	arrow?: [number, number] | null;
	highlightedArrow?: boolean;
	frameClass?: string;
	showDefault?: boolean;
	selected?: boolean;
	highlighted?: boolean;
};

const TalentIcon = forwardRef<HTMLButtonElement, Props>(
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
					'cursor group relative size-16 flex-shrink-0 focus:outline-none',
					!isClickable ? 'cursor-default' : 'cursor-pointer',
					className
				)}
				{...props}
			>
				{showDefault || icon ? (
					<Image
						src={`/api/icon/${
							showDefault && !icon ? 'inv_misc_questionmark' : icon
						}`}
						alt={icon === '' ? 'empty' : icon}
						width={64}
						height={64}
						unoptimized
						className="rounded-lg"
					/>
				) : (
					<Image
						src="/icon_frame.png"
						alt="frame"
						width={64}
						height={64}
						className={cls('absolute inset-0', frameClass)}
					/>
				)}
				<Image
					className={cls('absolute inset-0 rounded-lg p-[5%]', {
						'group-hover:block group-focus:block': isClickable,
						'hidden': !selected,
						'hue-rotate-180': selected
					})}
					src="/icon_hover.png"
					alt="hover"
					width={64}
					height={64}
				/>

				{highlighted && (
					<Image
						className={cls('absolute inset-0 scale-125 rounded-lg')}
						src="/icon_hover.png"
						alt="hover"
						width={64}
						height={64}
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

export default TalentIcon;
