'use client';

import cls from 'classnames';
import {
	CircleAlert,
	CircleCheck,
	CircleHelp,
	ClipboardCopy,
	X
} from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

import TextButton from './styled/TextButton';

type ToastProps = {
	id: string | number;
	type?: 'success' | 'error' | 'info';
	message: string | React.ReactNode;
};

const ToastComponent = ({ id, type, message }: ToastProps) => {
	const Icon =
		type === 'error'
			? CircleAlert
			: type === 'success'
				? CircleCheck
				: CircleHelp;

	return (
		<div className="haax-surface-3 bg-dark-gray max-w-md min-w-xs">
			<div className="flex gap-2">
				<Icon
					size={18}
					className={cls(
						'mt-1',
						type === 'error'
							? 'text-red'
							: type === 'success'
								? 'text-green'
								: 'text-yellow'
					)}
				/>

				<div className="line-clamp-4 shrink">{message}</div>
			</div>

			<div className="-m-2 flex justify-end gap-1">
				{typeof message === 'string' && (
					<TextButton
						onClick={() => navigator.clipboard.writeText(message)}
						icon={ClipboardCopy}
						iconSize={16}
					>
						Copy text
					</TextButton>
				)}
				{type === 'error' && (
					<TextButton
						onClick={() => sonnerToast.dismiss(id)}
						icon={X}
						iconSize={16}
					>
						Close
					</TextButton>
				)}
			</div>
		</div>
	);
};

export const toast = (toast: Omit<ToastProps, 'id'>) =>
	sonnerToast.custom(id => <ToastComponent id={id} {...toast} />);
