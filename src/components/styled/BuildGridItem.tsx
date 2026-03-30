'use client';

import { Workflow } from 'lucide-react';
import Link from 'next/link';

import { UserAvatar, UserRoleText } from '#components/styled/User.tsx';
import { type savedBuilds, type user } from '#server/db/schema.ts';
import { getLastUpdatedString, maskToClass } from '#utils/index.ts';

import SpellIcon from '../styled/SpellIcon';
import TextButton from '../styled/TextButton';
import Tooltip from '../styled/Tooltip';

type Props = typeof savedBuilds.$inferSelect & {
	href: string;
	createdBy: Pick<typeof user.$inferSelect, 'image' | 'name' | 'role'>;
};

const BuildGridItem = (item: Props) => {
	const classInfo = maskToClass(item.class);
	return (
		<Tooltip
			tooltip={() => (
				<>
					<h4 className="haax-color text-lg">
						{item.name ? `${item.name} ` : ''}
						{classInfo?.name}
					</h4>
					{item.createdBy && (
						<>
							<p className="whitespace-nowrap text-blue-gray">
								Last updated:{' '}
								<span>
									{new Date(item.updatedAt ?? item.createdAt).toLocaleString(
										'en-US'
									)}
								</span>
							</p>
							<div className="flex items-center gap-1.5 text-blue-gray">
								Author: <UserAvatar image={item.createdBy.image} />{' '}
								<UserRoleText role={item.createdBy.role}>
									{item.createdBy.name}
								</UserRoleText>
							</div>
						</>
					)}
				</>
			)}
			actions={() => (
				<TextButton icon={<Workflow />} type="link" href={item.href}>
					Open build
				</TextButton>
			)}
		>
			{props => (
				<Link
					href={item.href}
					className="-mb-2 flex items-center gap-3 p-2 hocus:haax-highlight"
					prefetch={false}
					{...props}
				>
					<SpellIcon icon={classInfo?.icon} showDefault />
					<div className="flex flex-col gap-1 text-inherit">
						<p
							className="truncate text-lg text-inherit"
							style={{ color: classInfo?.color }}
						>
							{item.name ? `${item.name} ` : ''}
							{classInfo?.name}
						</p>
						<div className="flex items-center gap-1.5 truncate text-blue-gray">
							<UserAvatar image={item.createdBy?.image} />
							{item.createdBy.name === 'TurtleWoW'
								? 'TurtleWoW'
								: getLastUpdatedString(item.updatedAt ?? item.createdAt)}
						</div>
					</div>
				</Link>
			)}
		</Tooltip>
	);
};

export default BuildGridItem;
