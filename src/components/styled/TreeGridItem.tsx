'use client';

import Link from 'next/link';
import cls from 'classnames';
import { CloudOff, EyeOff, Workflow } from 'lucide-react';

import SpellIcon from '#components/styled/SpellIcon.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import Tooltip from '#components/styled/Tooltip.tsx';
import { UserAvatar, UserRoleText } from '#components/styled/User.tsx';
import { type TalentForm } from '#server/schemas.ts';
import {
	getLastUpdatedString,
	getTalentSum,
	maskToClass
} from '#utils/index.ts';

import { GameVersionLogo } from './GameVersion';

type Item = TalentForm & {
	href: string;
	label?: string;
	active?: boolean;
	onClick?: (e: React.MouseEvent) => void;
};

const TreeGridItem = (item: Item) => {
	const classInfo = maskToClass(item.class);
	const date = item.updatedAt ?? item.createdAt;
	return (
		<Tooltip
			tooltip={() => (
				<>
					<h4 className="haax-color text-xl">{item.name}</h4>
					{item.visibility === 'private' && (
						<span className="text-warm-green flex items-center gap-1 text-sm">
							<EyeOff size={14} />
							Private
						</span>
					)}
					<div className="text-blue-gray">
						Points: <span>{getTalentSum(item.talents, item.rows)}</span>
					</div>
					<div className="text-blue-gray flex items-center gap-1.5">
						Version:
						<GameVersionLogo rows={item.rows} />
						<span>{item.rows} rows</span>
					</div>
					{date && (
						<div className="text-blue-gray whitespace-nowrap">
							Last updated:{' '}
							<span>{new Date(date).toLocaleString('en-US')}</span>
						</div>
					)}
					{item.createdBy && (
						<div className="text-blue-gray flex items-center gap-1.5">
							Author: <UserAvatar image={item.createdBy.image} />{' '}
							<UserRoleText role={item.createdBy.role}>
								{item.createdBy.name}
							</UserRoleText>
						</div>
					)}
					{classInfo && (
						<div className="text-blue-gray flex items-center gap-1">
							Class:{' '}
							<SpellIcon icon={classInfo.icon} showDefault className="size-6" />{' '}
							<span style={{ color: classInfo.color }}>{classInfo.name}</span>
						</div>
					)}
				</>
			)}
			actions={() => (
				<TextButton
					icon={<Workflow />}
					type="link"
					href={item.href}
					onClick={item.onClick}
				>
					{item.label ?? 'Open tree'}
				</TextButton>
			)}
		>
			{props => (
				<Link
					href={item.href}
					prefetch={false}
					onClick={item.onClick}
					className={cls(
						'hocus:haax-highlight -mb-2 flex items-center gap-3 p-2',
						{ 'text-warm-green': item.active }
					)}
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
						<div
							className={cls(
								'-ml-1 flex items-center gap-1.5',
								item.visibility === 'private' && 'text-warm-green'
							)}
						>
							<GameVersionLogo rows={item.rows} />
							<p className="shrink truncate overflow-hidden text-lg whitespace-nowrap text-inherit">
								{item.name}
							</p>
							{item.visibility === 'private' && <EyeOff size={14} />}
						</div>
						<div className="flex items-center gap-1.5">
							{item.createdBy ? (
								<UserAvatar image={item.createdBy.image} />
							) : (
								<CloudOff className="text-blue-gray" />
							)}
							<span className="text-blue-gray shrink truncate overflow-hidden whitespace-nowrap">
								{date ? getLastUpdatedString(date) : 'Local only'}
							</span>
						</div>
					</div>
				</Link>
			)}
		</Tooltip>
	);
};

export default TreeGridItem;
