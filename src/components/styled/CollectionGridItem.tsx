'use client';

import Link from 'next/link';
import cls from 'classnames';
import { EyeOff, LibraryBig } from 'lucide-react';

import Tooltip from '#components/styled/Tooltip.tsx';
import { UserAvatar, UserRoleText } from '#components/styled/User.tsx';
import { type CollectionForm } from '#server/schemas.ts';
import { getLastUpdatedString } from '#utils/index.ts';

import SpellIcon from './SpellIcon';
import TextButton from './TextButton';

type Props = {
	item: CollectionForm;
	href: string;
};

const CollectionGridItem = ({ item, href }: Props) => {
	const date = item.updatedAt ?? item.createdAt;
	return (
		<Tooltip
			tooltip={() => (
				<>
					<h4 className="haax-color text-xl">{item.name}</h4>
					{item.visibility === 'private' && (
						<span className="flex items-center gap-1 text-sm text-warm-green">
							<EyeOff size={14} />
							Private
						</span>
					)}
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
				</>
			)}
			actions={() => (
				<TextButton icon={<LibraryBig />} type="link" href={href}>
					Open collection
				</TextButton>
			)}
		>
			{props => (
				<Link
					href={href}
					prefetch={false}
					className="-mb-2 flex items-center gap-3 p-2 hocus:haax-highlight"
					{...props}
				>
					<SpellIcon icon={item.icon} showDefault />

					<div className="flex shrink grow flex-col gap-1 text-inherit">
						<div
							className={cls(
								'flex items-center gap-1.5',
								item.visibility === 'private' && 'text-warm-green'
							)}
						>
							<p className="shrink truncate overflow-hidden text-lg whitespace-nowrap text-inherit">
								{item.name}
							</p>
							{item.visibility === 'private' && <EyeOff size={14} />}
						</div>
						<div className="flex items-center gap-1.5">
							<UserAvatar image={item.createdBy?.image} />

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

export default CollectionGridItem;
