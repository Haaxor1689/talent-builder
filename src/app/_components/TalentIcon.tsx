import cls from 'classnames';
import { forwardRef } from 'react';
import Image from 'next/image';

import TalentArrow from './TalentArrow';

type Props = React.DetailedHTMLProps<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
> & {
	clickable?: true;
	icon?: string | null;
	ranks?: number | null;
	arrow?: [number, number] | null;
	frameClass?: string;
	showDefault?: boolean;
	selected?: boolean;
};

const TalentIcon = forwardRef<HTMLButtonElement, Props>(
	(
		{
			icon,
			ranks,
			arrow,
			showDefault,
			selected,
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
						alt={icon ?? 'empty'}
						width={64}
						height={64}
						className="rounded-lg"
					/>
				) : (
					<Image
						className={cls('absolute inset-0', frameClass)}
						src="/icon_frame.png"
						alt="frame"
						width={64}
						height={64}
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

				{!!ranks && (
					<p className="absolute bottom-1 right-1 w-5 translate-x-1/2 translate-y-1/2 rounded border-0 bg-darkGray">
						{ranks}
					</p>
				)}

				{!!arrow && <TalentArrow start={arrow[0]} end={arrow[1]} />}
			</button>
		);
	}
);

export default TalentIcon;
