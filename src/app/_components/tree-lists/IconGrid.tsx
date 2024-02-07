'use client';

import Link from 'next/link';
import { CloudOff } from 'lucide-react';

import { getTalentSum } from '~/utils';
import { type talentTrees, type users } from '~/server/db/schema';

import TalentIcon from '../builder/TalentIcon';
import useTooltip from '../hooks/useTooltip';

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

const Icon = (item: Item) => {
	const { elementProps, tooltipProps } = useTooltip();
	return (
		<>
			<Link
				key={item.href}
				href={item.href}
				className="tw-hocus flex items-center gap-3 p-2"
				{...elementProps}
			>
				<TalentIcon
					icon={item.icon}
					showDefault
					className="cursor-pointer items-center self-center"
				/>
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
				className="tw-surface max-w-[400px] bg-darkerGray/90"
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
							Author:
							<div
								className="size-7 rounded-full bg-contain"
								style={{ backgroundImage: `url(${item.createdBy?.image})` }}
							/>
							<span>{item.createdBy?.name}</span>
						</div>
					</>
				)}
			</div>
		</>
	);
};

type Props = {
	title: string;
	list: Item[];
};

const IconGrid = ({ title, list }: Props) => (
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
					<Icon key={item.href} {...item} />
				))}
			</div>
		</div>
	</div>
);

export default IconGrid;
