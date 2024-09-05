'use client';

import Link from 'next/link';
import { Workflow } from 'lucide-react';

import { type savedBuilds, type users } from '~/server/db/schema';
import { getLastUpdatedString, maskToClass } from '~/utils';

import SpellIcon from '../styled/SpellIcon';
import Tooltip from '../styled/Tooltip';
import AuthorTag from '../styled/AuthorTag';
import TextButton from '../styled/TextButton';

type Item = typeof savedBuilds.$inferSelect & {
	href: string;
	createdBy: typeof users.$inferSelect;
};

const GridItem = (item: Item) => {
	const classInfo = maskToClass(item.class);
	return (
		<Tooltip
			tooltip={
				<>
					<h4 className="tw-color text-lg">
						{item.name ? `${item.name} ` : ''}
						{classInfo?.name}
					</h4>
					{item.createdBy && (
						<>
							<p className="whitespace-nowrap text-blueGray">
								Last updated:{' '}
								<span>
									{new Date(item.updatedAt ?? item.createdAt).toLocaleString(
										'en-US'
									)}
								</span>
							</p>
							<div className="flex items-center gap-1.5 text-blueGray">
								Author: <AuthorTag {...item.createdBy} />
							</div>
						</>
					)}
				</>
			}
			actions={() => (
				<TextButton type="link" href={item.href} icon={Workflow}>
					Open build
				</TextButton>
			)}
		>
			<Link
				href={item.href}
				className="tw-hocus -mb-2 flex items-center gap-3 p-2"
				prefetch={false}
			>
				<SpellIcon
					icon={classInfo?.icon}
					showDefault
					className="shrink-0 cursor-pointer"
				/>
				<div className="flex flex-col gap-1 text-inherit">
					<p
						className="truncate text-lg text-inherit"
						style={{ color: classInfo?.color }}
					>
						{item.name ? `${item.name} ` : ''}
						{classInfo?.name}
					</p>
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
				</div>
			</Link>
		</Tooltip>
	);
};

type Props = {
	title: string;
	list: Item[];
};

const BuildsGrid = ({ title, list }: Props) => (
	<div className="flex flex-col items-stretch gap-2 md:flex-row">
		<h3
			className="tw-color hidden w-[48px] py-3 md:block"
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

export default BuildsGrid;
