'use client';

import Link from 'next/link';

import { type TalentTreeTable } from '~/server/db/schema';
import { getTalentSum } from '~/utils';

import TalentIcon from '../builder/TalentIcon';
import useTooltip from '../hooks/useTooltip';

type Item = TalentTreeTable & { href: string };

// TODO: Add user info to tooltip
const Icon = (s: Item) => {
	const { elementProps, tooltipProps } = useTooltip();
	return (
		<>
			<Link
				key={s.href}
				href={s.href}
				className="tw-hocus flex flex-col gap-1"
				{...elementProps}
			>
				<TalentIcon
					icon={s.icon}
					showDefault
					className="cursor-pointer self-center"
				/>
				<p className="truncate text-center text-inherit">{s.name}</p>
			</Link>
			<div
				className="tw-surface max-w-[400px] bg-darkerGray/90"
				{...tooltipProps}
			>
				<h4 className="tw-color text-lg">{s.name}</h4>
				<p className="text-blueGray">
					Points: <span>{getTalentSum(s.tree)}</span>
				</p>
			</div>
		</>
	);
};

type Props = {
	title: string;
	list: Item[];
};

const IconGrid = ({ title, list }: Props) => (
	<div className="flex items-start gap-3">
		<h3
			className="tw-color py-3"
			style={{ textOrientation: 'mixed', writingMode: 'vertical-rl' }}
		>
			{title}
		</h3>
		<div
			className="grid grow gap-x-2 gap-y-6 md:p-4"
			style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}
		>
			{list.map(item => (
				<Icon key={item.href} {...item} />
			))}
		</div>
	</div>
);

export default IconGrid;
