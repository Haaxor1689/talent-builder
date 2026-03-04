import cls from 'classnames';

import { type user } from '#server/db/schema.ts';

const AuthorTag = ({
	image,
	name,
	role
}: Pick<typeof user.$inferSelect, 'image' | 'name' | 'role'>) => (
	<>
		<div
			className="size-7 rounded-full bg-contain"
			style={{
				backgroundImage: `url(${image}), url(https://cdn.discordapp.com/embed/avatars/0.png)`
			}}
		/>
		<span
			className={cls('hidden select-none sm:inline', {
				'text-green font-bold': role === 'admin',
				'text-[#41c8d4]': role === 'supporter'
			})}
		>
			{name}
		</span>
	</>
);

export default AuthorTag;
