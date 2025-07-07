'use client';

import Link from 'next/link';
import { CloudOff, EyeOff, Workflow } from 'lucide-react';

import { getLastUpdatedString, getTalentSum, maskToClass } from '~/utils';
import { type talentTrees } from '~/server/db/schema';

import SpellIcon from '../styled/SpellIcon';
import AuthorTag, { type AuthorTagProps } from '../styled/AuthorTag';
import Tooltip from '../styled/Tooltip';
import TextButton from '../styled/TextButton';

type Item = typeof talentTrees.$inferSelect & {
	href: string;
	createdBy: AuthorTagProps;
};

const TreeGridItem = (item: Item) => {
	const classInfo = maskToClass(item.class);
	return (
		<Tooltip
			tooltip={
				<>
					<h4 className="tw-color text-lg">{item.name}</h4>
					{!item.public && (
						<span className="flex items-center gap-1 text-lg text-warmGreen">
							<EyeOff className="w-4 shrink-0" />
							Private
						</span>
					)}
					<p className="text-blueGray">
						Points: <span>{getTalentSum(item.talents)}</span>
					</p>
					{item.createdBy && (
						<>
							<span className="whitespace-nowrap text-blueGray">
								Last updated:{' '}
								<span>
									{new Date(item.updatedAt ?? item.createdAt).toLocaleString(
										'en-US'
									)}
								</span>
							</span>
							<div className="flex items-center gap-1.5 text-blueGray">
								Author: <AuthorTag {...item.createdBy} />
							</div>
						</>
					)}
					{classInfo && (
						<p className="flex items-center gap-1 text-blueGray">
							Class:{' '}
							<SpellIcon icon={classInfo.icon} showDefault className="size-6" />{' '}
							<span style={{ color: classInfo.color }}>{classInfo.name}</span>
						</p>
					)}
				</>
			}
			actions={() => (
				<TextButton type="link" href={item.href} icon={Workflow}>
					Open tree
				</TextButton>
			)}
		>
			<Link
				href={item.href}
				className="tw-hocus -mb-2 flex items-center gap-3 p-2"
				prefetch={false}
			>
				<div className="relative flex shrink-0 items-center">
					<SpellIcon icon={item.icon} showDefault className="cursor-pointer" />
					{classInfo && (
						<div className="pointer-events-none absolute -bottom-4 -right-2">
							<SpellIcon icon={classInfo.icon} className="size-6" />
						</div>
					)}
				</div>
				<div className="flex grow flex-col gap-1 text-inherit">
					<p className="truncate text-lg text-inherit">{item.name}</p>
					{item.createdBy ? (
						<div className="flex items-center gap-1.5 truncate">
							<div
								className="size-6 shrink-0 rounded-full bg-contain"
								style={{
									backgroundImage: `url(${item.createdBy?.image}), url(https://cdn.discordapp.com/embed/avatars/0.png)`
								}}
							/>
							<span className="grow text-blueGray">
								{item.createdBy.name === 'TurtleWoW'
									? 'TurtleWoW'
									: getLastUpdatedString(item.updatedAt ?? item.createdAt)}
							</span>
							{!item.public && (
								<span className="flex items-center gap-1 text-xs text-warmGreen">
									<EyeOff className="w-4 shrink-0" />
									Private
								</span>
							)}
						</div>
					) : (
						<div className="flex items-center gap-1.5 text-blueGray">
							<CloudOff size={24} />
							Local only
						</div>
					)}
				</div>
			</Link>
		</Tooltip>
	);
};

export default TreeGridItem;
