import {
	type CSSProperties,
	type FunctionComponent,
	type MouseEventHandler,
	type ReactNode
} from 'react';
import Link from 'next/link';
import cls from 'classnames';
import { omit } from 'es-toolkit';
import { type LucideIcon } from 'lucide-react';

import Spinner from './Spinner';

export type IconType =
	| FunctionComponent<{ size?: number; className?: string }>
	| LucideIcon;

type Props = {
	active?: boolean;
	loading?: boolean;
	disabled?: boolean;
	tabIndex?: number;
	iconSize?: number;
	className?: string;
	style?: CSSProperties;
} & (
	| { type: 'submit'; form?: string }
	| {
			type?: never;
			onClick: MouseEventHandler<HTMLButtonElement>;
			onDoubleClick?: MouseEventHandler<HTMLButtonElement>;
			onContextMenu?: MouseEventHandler<HTMLButtonElement>;
			onMouseEnter?: MouseEventHandler<HTMLButtonElement>;
			onMouseLeave?: MouseEventHandler<HTMLButtonElement>;
	  }
	| {
			href: string;
			type: 'link';
			onClick?: MouseEventHandler<HTMLButtonElement>;
			external?: boolean;
	  }
) &
	(
		| { children: ReactNode; icon?: IconType; title?: never }
		| { children?: never; icon: IconType; title: string }
	);

// TODO: Make server compatible by changing how Icon is passed
const TextButton = ({
	title,
	active,
	loading,
	disabled,
	tabIndex,
	icon: Icon,
	iconSize,
	className,
	children,
	...props
}: Props) => {
	const Component = props.type === 'link' ? Link : 'button';
	return (
		<Component
			{...omit(props, ['external'] as never)}
			title={title ?? (typeof children === 'string' ? children : undefined)}
			tabIndex={!!loading || !!disabled ? -1 : tabIndex}
			className={cls(
				'flex cursor-pointer items-center gap-1 border-0 p-2',
				className,
				{
					'text-warm-green': active && !loading && !disabled,
					'text-gray pointer-events-none': !!loading || !!disabled,
					'hocus:haax-highlight transition-all': !loading && !disabled
				}
			)}
			{...((props.type === 'link'
				? {
						href: props.href,
						onClick: props.onClick,
						target: props.external ? '_blank' : undefined,
						rel: props.external ? 'noopener noreferrer' : undefined
					}
				: props.type === 'submit'
					? { form: props.form }
					: {
							type: 'button',
							onClick: props.onClick,
							onDoubleClick: props.onDoubleClick,
							onContextMenu: props.onContextMenu
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
						}) as any)}
		>
			{loading ? (
				<Spinner size={iconSize ?? 24} />
			) : (
				Icon && <Icon size={iconSize ?? 24} />
			)}
			{children && (
				<span className="cursor-pointer [font-size:inherit] text-inherit select-none">
					{children}
				</span>
			)}
		</Component>
	);
};

export default TextButton;
