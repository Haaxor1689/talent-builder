'use client';

import Link from 'next/link';
import { CloudOff, EyeOff, Workflow } from 'lucide-react';

import SpellIcon from '#components/styled/SpellIcon.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import Tooltip from '#components/styled/Tooltip.tsx';
import { UserAvatar, UserRoleText } from '#components/styled/User.tsx';
import { type talentTrees, type user } from '#server/db/schema.ts';
import {
	getLastUpdatedString,
	getTalentSum,
	maskToClass
} from '#utils/index.ts';

type Item = typeof talentTrees.$inferSelect & {
	href: string;
	createdBy: Pick<typeof user.$inferSelect, 'image' | 'name' | 'role'> | null;
	label?: string;
	onClick?: (
		e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>
	) => void;
};

const TreeGridItem = (item: Item) => {
	const classInfo = maskToClass(item.class);
	return (
		<Tooltip
			tooltip={
				<>
					<h4 className="haax-color text-xl">{item.name}</h4>
					{!item.public && (
						<span className="text-warm-green flex items-center gap-1 text-lg">
							<EyeOff className="w-4 shrink-0" />
							Private
						</span>
					)}
					<p className="text-blue-gray">
						Points: <span>{getTalentSum(item.talents)}</span>
					</p>
					{item.createdBy && (
						<>
							<span className="text-blue-gray whitespace-nowrap">
								Last updated:{' '}
								<span>
									{new Date(item.updatedAt ?? item.createdAt).toLocaleString(
										'en-US'
									)}
								</span>
							</span>
							<div className="text-blue-gray flex items-center gap-1.5">
								Author: <UserAvatar image={item.createdBy.image} />{' '}
								<UserRoleText role={item.createdBy.role}>
									{item.createdBy.name}
								</UserRoleText>
							</div>
						</>
					)}
					{classInfo && (
						<div className="text-blue-gray flex items-center gap-1">
							Class:{' '}
							<SpellIcon icon={classInfo.icon} showDefault className="size-6" />{' '}
							<span style={{ color: classInfo.color }}>{classInfo.name}</span>
						</div>
					)}
				</>
			}
			actions={
				<TextButton
					type="link"
					href={item.href}
					onClick={item.onClick}
					icon={Workflow}
				>
					{item.label ?? 'Open tree'}
				</TextButton>
			}
		>
			{props => (
				<Link
					href={item.href}
					className="hocus:haax-highlight -mb-2 flex items-center gap-3 p-2"
					prefetch={false}
					onClick={item.onClick}
					{...props}
				>
					<SpellIcon
						icon={item.icon}
						showDefault
						className="cursor-pointer"
						extraContent={
							classInfo && (
								<SpellIcon
									icon={classInfo.icon}
									className="absolute! -right-2 -bottom-2 size-6"
								/>
							)
						}
					/>

					<div className="flex shrink grow flex-col gap-1 text-inherit">
						<p className="truncate text-lg text-inherit">{item.name}</p>
						{item.createdBy ? (
							<div className="flex items-center gap-1.5">
								<UserAvatar image={item.createdBy.image} />
								<span className="text-blue-gray shrink grow truncate overflow-hidden whitespace-nowrap">
									{item.createdBy.name === 'TurtleWoW'
										? 'TurtleWoW'
										: getLastUpdatedString(item.updatedAt ?? item.createdAt)}
								</span>
								{!item.public && (
									<span className="text-warm-green flex items-center gap-1.5">
										<EyeOff className="w-4" />
										Private
									</span>
								)}
							</div>
						) : (
							<div className="text-blue-gray flex items-center gap-1.5">
								<CloudOff size={24} />
								Local only
							</div>
						)}
					</div>
				</Link>
			)}
		</Tooltip>
	);
};

export default TreeGridItem;
