import cls from 'classnames';
import { type LucideIcon } from 'lucide-react';
import { type MouseEventHandler, type ReactNode } from 'react';

import Spinner from './Spinner';

type Props = {
	active?: boolean;
	loading?: boolean;
	disabled?: boolean;
	tabIndex?: number;
	iconSize?: number;
	onDoubleClick?: MouseEventHandler<HTMLButtonElement>;
	onContextMenu?: MouseEventHandler<HTMLButtonElement>;
	className?: cls.Value;
} & (
	| { type: 'submit'; form?: string; onClick?: never }
	| { type?: never; onClick: MouseEventHandler<HTMLButtonElement> }
) &
	(
		| { children: ReactNode; icon?: LucideIcon; title?: never }
		| { children?: never; icon: LucideIcon; title: string }
	);

const TextButton = ({
	title,
	type,
	active,
	loading,
	disabled,
	tabIndex,
	icon: Icon,
	iconSize,
	onClick,
	onDoubleClick,
	onContextMenu,
	className,
	children,
	...props
}: Props) => (
	<button
		title={title ?? (typeof children === 'string' ? children : undefined)}
		type={type ?? 'button'}
		onClick={onClick}
		onDoubleClick={onDoubleClick}
		onContextMenu={onContextMenu}
		tabIndex={!!loading || !!disabled ? -1 : tabIndex}
		className={cls(
			'flex cursor-pointer items-center gap-1 border-0 p-2 ',
			className,
			{
				'!text-pink/70': active && !loading && !disabled,
				'pointer-events-none text-gray': !!loading || !!disabled,
				'tw-hocus': !loading && !disabled
			}
		)}
		{...props}
	>
		{loading ? (
			<Spinner size={iconSize ?? 24} />
		) : (
			Icon && <Icon size={iconSize} />
		)}
		{children && (
			<span className="cursor-pointer select-none text-inherit [font-size:inherit]">
				{children}
			</span>
		)}
	</button>
);

export default TextButton;
