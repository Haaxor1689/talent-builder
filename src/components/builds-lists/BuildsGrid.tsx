'use client';

import Link from 'next/link';
import { Workflow } from 'lucide-react';

import { type savedBuilds, type user } from '#server/db/schema.ts';
import { getLastUpdatedString, maskToClass } from '#utils/index.ts';

import AuthorTag from '../styled/AuthorTag';
import SpellIcon from '../styled/SpellIcon';
import TextButton from '../styled/TextButton';
import Tooltip from '../styled/Tooltip';

type Item = typeof savedBuilds.$inferSelect & {
	href: string;
	createdBy: Pick<typeof user.$inferSelect, 'image' | 'name' | 'role'>;
};

const GridItem = (item: Item) => {
	const classInfo = maskToClass(item.class);
	return (
		<Tooltip
			tooltip={
				<>
					<h4 className="haax-color text-lg">
						{item.name ? `${item.name} ` : ''}
						{classInfo?.name}
					</h4>
					{item.createdBy && (
						<>
							<p className="text-blue-gray whitespace-nowrap">
								Last updated:{' '}
								<span>
									{new Date(item.updatedAt ?? item.createdAt).toLocaleString(
										'en-US'
									)}
								</span>
							</p>
							<div className="text-blue-gray flex items-center gap-1.5">
								Author: <AuthorTag {...item.createdBy} />
							</div>
						</>
					)}
				</>
			}
			actions={
				<TextButton type="link" href={item.href} icon={Workflow}>
					Open build
				</TextButton>
			}
		>
			<Link
				href={item.href}
				className="hocus:haax-highlight -mb-2 flex items-center gap-3 p-2"
				prefetch={false}
			>
				<SpellIcon
					icon={classInfo?.icon}
					showDefault
					className="cursor-pointer"
				/>
				<div className="flex flex-col gap-1 text-inherit">
					<p
						className="truncate text-lg text-inherit"
						style={{ color: classInfo?.color }}
					>
						{item.name ? `${item.name} ` : ''}
						{classInfo?.name}
					</p>
					<div className="text-blue-gray flex items-center gap-1.5 truncate">
						<div
							className="size-6 rounded-full bg-contain"
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
			className="haax-color hidden w-12 py-3 md:block"
			style={{ textOrientation: 'mixed', writingMode: 'vertical-rl' }}
		>
			{title}
		</h3>
		<h3 className="haax-color px-2 md:hidden">{title}</h3>
		<div className="haax-surface-3 grow p-2 md:p-4">
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
