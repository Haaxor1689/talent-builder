import cls from 'classnames';

type Props = React.DetailedHTMLProps<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
> & {
	icon?: string;
	ranks?: number | null;
	frameClass?: string;
	showDefault?: boolean;
	highlight?: boolean;
};

const Icon = ({
	icon,
	ranks,
	showDefault,
	highlight,
	frameClass,
	className,
	...props
}: Props) => (
	<button
		type="button"
		tabIndex={!props.onClick ? -1 : undefined}
		className={cls(
			'group relative w-[68px] h-[68px] flex-shrink-0 focus:outline-none',
			{ 'cursor-default': !props.onClick },
			className
		)}
		{...props}
	>
		{(showDefault || icon) && (
			<img
				className="p-[6px]"
				src={`https://wow.zamimg.com/images/wow/icons/large/${
					showDefault && !icon ? 'inv_misc_questionmark' : icon
				}.jpg`}
				alt={icon}
			/>
		)}
		<img
			className={cls('absolute inset-0', frameClass)}
			src="https://wow.zamimg.com/images/Icon/large/border/default.png"
			alt="frame"
		/>
		<img
			className={cls(
				'absolute inset-0 rounded-[8px] p-[3px] group-focus:saturate-0',
				{
					['group-focus:block group-hover:block']: !!props.onClick,
					'hidden': !highlight,
					'hue-rotate-180': highlight
				}
			)}
			src="https://wow.zamimg.com/images/Icon/large/hilite/default.png"
			alt="hover"
		/>
		{!!ranks && (
			<p className="absolute bottom-1 right-1 translate-x-1/2 translate-y-1/2 border rounded bg-slate-800 w-5">
				{ranks}
			</p>
		)}
	</button>
);

export default Icon;
