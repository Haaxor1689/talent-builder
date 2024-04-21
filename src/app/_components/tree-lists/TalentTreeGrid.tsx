'use client';

import Link from 'next/link';
import { CloudOff } from 'lucide-react';

import { getTalentSum, maskToClass } from '~/utils';
import { type talentTrees, type users } from '~/server/db/schema';

import TalentIcon from '../styled/TalentIcon';
import useTooltip from '../hooks/useTooltip';
import AuthorTag from '../styled/AuthorTag';

const getLastUpdatedString = (date: Date) => {
	if (!date) return 'Never';
	const now = new Date();
	const diff = now.getTime() - new Date(date).getTime();
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor(diff / (1000 * 60));
	const seconds = Math.floor(diff / 1000);
	const plural = (n: number) => (n === 1 ? '' : 's');
	if (days > 0) return `${days} day${plural(days)} ago`;
	if (hours > 0) return `${hours} hour${plural(hours)} ago`;
	if (minutes > 0) return `${minutes} minute${plural(minutes)} ago`;
	return `${seconds} second${plural(seconds)} ago`;
};

type Item = typeof talentTrees.$inferSelect & {
	href: string;
	createdBy: typeof users.$inferSelect;
};

const GridItem = (item: Item) => {
	const { elementProps, tooltipProps } = useTooltip();
	const classInfo = maskToClass(item.class);
	return (
		<>
			<Link
				href={item.href}
				className="tw-hocus -mb-2 flex items-center gap-3 p-2"
				prefetch={false}
				{...elementProps}
			>
				<div className="relative flex shrink-0 items-center">
					<TalentIcon icon={item.icon} showDefault className="cursor-pointer" />
					{classInfo && (
						<div className="pointer-events-none absolute -bottom-4 -right-2">
							<TalentIcon icon={classInfo.icon} className="size-6" />
						</div>
					)}
				</div>
				<div className="flex flex-col gap-1 text-inherit">
					<p className="truncate text-lg text-inherit">{item.name}</p>
					{item.createdBy ? (
						<div className="flex items-center gap-1.5 truncate text-blueGray">
							<div
								className="size-6 shrink-0 rounded-full bg-contain"
								style={{ backgroundImage: `url(${item.createdBy?.image})` }}
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
			<div
				className="tw-surface max-w-[400px] whitespace-nowrap bg-darkerGray/90"
				{...tooltipProps}
			>
				<h4 className="tw-color text-lg">{item.name}</h4>
				<p className="text-blueGray">
					Points: <span>{getTalentSum(item.tree)}</span>
				</p>
				{item.createdBy && (
					<>
						<span className="text-blueGray">
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
						<TalentIcon icon={classInfo.icon} showDefault className="size-6" />{' '}
						<span style={{ color: classInfo.color }}>{classInfo.name}</span>
					</p>
				)}
			</div>
		</>
	);
};

type Props = {
	title: string;
	list: Item[];
};

const TalentTreeGrid = ({ title, list }: Props) => (
	<div className="flex flex-col items-stretch gap-2 md:flex-row">
		<h3
			className="tw-color hidden py-3 md:block"
			style={{ textOrientation: 'mixed', writingMode: 'vertical-rl' }}
		>
			{title}
		</h3>
		<h3 className="tw-color px-2 md:hidden">{title}</h3>
		<div className="tw-surface grow p-2 md:p-4">
			<div
				className="grid items-start gap-3"
				style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
			>
				{list.map(item => (
					<GridItem key={item.href} {...item} />
				))}
			</div>
		</div>
	</div>
);

export default TalentTreeGrid;
