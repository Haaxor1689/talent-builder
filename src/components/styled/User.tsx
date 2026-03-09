import cls from 'classnames';

import { type user } from '#server/db/schema.ts';

export const UserRoleText = ({
	role,
	className,
	children
}: {
	role: (typeof user.$inferSelect)['role'];
	className?: string;
	children: React.ReactNode;
}) => (
	<span
		className={cls(className, {
			'text-green font-bold': role === 'admin',
			'text-[#41c8d4]': role === 'supporter'
		})}
	>
		{children}
	</span>
);

export const UserAvatar = ({
	image,
	size = 24,
	className
}: {
	image?: string | null;
	size?: 24 | 32 | 128 | 160 | 256;
	className?: string;
}) => (
	<div
		className={cls('rounded-full bg-contain', className)}
		style={{
			width: size,
			height: size,
			backgroundImage: `url(${image}?size=${size}), url(https://cdn.discordapp.com/embed/avatars/0.png)`
		}}
	/>
);
