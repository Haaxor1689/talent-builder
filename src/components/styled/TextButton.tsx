import cls from 'classnames';
import { omit } from 'es-toolkit';
import Link from 'next/link';
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	type CSSProperties,
	type MouseEventHandler,
	type ReactNode
} from 'react';

import Spinner from './Spinner';

type Props = {
	active?: boolean;
	loading?: boolean;
	disabled?: boolean;
	tabIndex?: number;
	className?: string;
	style?: CSSProperties;
} & (
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
		| { children: ReactNode; icon?: ReactNode; title?: never }
		| { children?: never; icon: ReactNode; title: string }
	);

const TextButton = ({
	active,
	loading,
	disabled,
	tabIndex,
	icon,
	className,
	children,
	...props
}: Props) => {
	const Component = props.type === 'link' ? Link : 'button';
	return (
		<Component
			tabIndex={!!loading || !!disabled ? -1 : tabIndex}
			{...omit(props, ['external'] as never)}
			{...((props.type === 'link'
				? {
						target: props.external ? '_blank' : undefined,
						rel: props.external ? 'noopener noreferrer' : undefined,
						prefetch: false
					}
				: { type: 'button' }) as any)}
			className={cls(
				'flex cursor-pointer items-center gap-1 border-0 p-2 select-none',
				className,
				{
					'text-warm-green': active && !loading && !disabled,
					'pointer-events-none text-gray': !!loading || !!disabled,
					'transition-all hocus:haax-highlight': !loading && !disabled
				}
			)}
		>
			{loading ? <Spinner /> : icon}
			{children}
		</Component>
	);
};

export default TextButton;
