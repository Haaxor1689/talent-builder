'use client';

import Link from 'next/link';
import { CloudOff, Workflow } from 'lucide-react';
import cls from 'classnames';

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

const GridItem = (item: Item) => {
	const classInfo = maskToClass(item.class);
	return (
		<Tooltip
			tooltip={
				<>
					<h4 className="tw-color text-lg">{item.name}</h4>
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
				<div className="flex flex-col gap-1 text-inherit">
					<p className="truncate text-lg text-inherit">{item.name}</p>
					{item.createdBy ? (
						<div className="flex items-center gap-1.5 truncate text-blueGray">
							<div
								className="size-6 shrink-0 rounded-full bg-contain"
								style={{
									backgroundImage: `url(${item.createdBy?.image}), url(https://cdn.discordapp.com/embed/avatars/0.png)`
								}}
							/>
							{item.createdBy.name === 'TurtleWoW'
								? 'TurtleWoW'
								: getLastUpdatedString(item.updatedAt ?? item.createdAt)}
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

type Props = {
	list: Item[];
	className?: cls.Value;
};

const TalentTreeGrid = ({ list, className }: Props) => (
	<div className={cls('tw-surface grow p-2 md:p-4', className)}>
		<div
			className="grid items-start gap-3"
			style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
		>
			{list.map(item => (
				<GridItem key={item.href} {...item} />
			))}
		</div>
	</div>
);

export default TalentTreeGrid;
