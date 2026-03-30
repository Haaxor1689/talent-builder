import cls from 'classnames';

import { type user } from '#server/db/schema.ts';

import SpellIcon from './SpellIcon';

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
			'text-supporter': role === 'supporter'
		})}
	>
		{children}
	</span>
);

const fallbackAvatar = 'https://cdn.discordapp.com/embed/avatars/0.png';

export const UserAvatar = ({
	image,
	size = 24
}: {
	image?: string | null;
	size?: 24 | 32 | 160;
}) => (
	<SpellIcon
		icon={image ? `${image}?size=${size}` : fallbackAvatar}
		fallbackIcon={fallbackAvatar}
		className={size === 24 ? 'size-6' : size === 32 ? 'size-8' : 'size-40'}
	/>
);
