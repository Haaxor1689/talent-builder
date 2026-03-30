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

type Item = {
	item: TalentForm;
	href: string;
	label?: string;
	active?: boolean;
	hideTooltip?: boolean;
	onClick?: (e: React.MouseEvent) => void;
	onDragStart?: (e: React.DragEvent) => void;
};

const TreeGridItem = ({
	item,
	href,
	label,
	active,
	hideTooltip,
	onClick,
	onDragStart
}: Item) => {
	const classInfo = maskToClass(item.class);
	const date = item.updatedAt ?? item.createdAt;
	return (
		<Tooltip
			hidden={hideTooltip}
			tooltip={() => (
				<>
					<h4 className="haax-color text-xl">{item.name}</h4>
					{item.visibility === 'private' && (
						<span className="flex items-center gap-1 text-sm text-warm-green">
							<EyeOff size={14} />
							Private
						</span>
					)}
					<div className="text-blue-gray">
						Points: <span>{getTalentSum(item.talents, item.rows)}</span>
					</div>
					<div className="flex items-center gap-1.5 text-blue-gray">
						Version:
						<GameVersionLogo rows={item.rows} />
						<span>{item.rows} rows</span>
					</div>
					{date && (
						<div className="whitespace-nowrap text-blue-gray">
							Last updated:{' '}
							<span>{new Date(date).toLocaleString('en-US')}</span>
						</div>
					)}
					{item.createdBy && (
						<div className="flex items-center gap-1.5 text-blue-gray">
							Author: <UserAvatar image={item.createdBy.image} />{' '}
							<UserRoleText role={item.createdBy.role}>
								{item.createdBy.name}
							</UserRoleText>
						</div>
					)}
					{classInfo && (
						<div className="flex items-center gap-1 text-blue-gray">
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
					href={href}
					onClick={onClick}
				>
					{label ?? 'Open tree'}
				</TextButton>
			)}
		>
			{props => (
				<Link
					href={href}
					prefetch={false}
					onClick={onClick}
					onDragStart={onDragStart}
					className={cls(
						'-mb-2 flex items-center gap-3 p-2 hocus:haax-highlight',
						{ 'text-warm-green': active }
					)}
					{...props}
				>
					<SpellIcon
						icon={item.icon}
						showDefault
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
							<span className="shrink truncate overflow-hidden whitespace-nowrap text-blue-gray">
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
