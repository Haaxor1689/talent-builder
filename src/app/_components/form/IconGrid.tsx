'use client';

import { Fragment, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { listIcons } from '~/server/api/routers/icon';

import TalentIcon from '../builder/TalentIcon';
import Spinner from '../styled/Spinner';
import useTooltip from '../hooks/useTooltip';

type IconProps = {
	item: { name: string; data: string };
	icon?: string;
	setIcon: (icon: string) => void;
};

const Icon = ({ item, icon, setIcon }: IconProps) => {
	const { elementProps, tooltipProps } = useTooltip();
	return (
		<>
			<TalentIcon
				icon={item.name}
				selected={icon === item.name}
				onClick={() => setIcon(item.name)}
				{...elementProps}
			/>
			<div
				className="tw-surface max-w-[400px] bg-darkerGray/90"
				{...tooltipProps}
			>
				{item.name}
			</div>
		</>
	);
};

type Props = {
	filter?: string;
	icon?: string;
	setIcon: (icon: string) => void;
	required?: boolean;
};

const IconGrid = ({ filter, required, icon, setIcon }: Props) => {
	const icons = useInfiniteQuery({
		queryKey: ['icons', filter],
		queryFn: async ({ pageParam = 0 }) =>
			await listIcons({
				limit: 64,
				filter,
				cursor: pageParam
			}),
		getNextPageParam: prev => prev.nextCursor,
		staleTime: Infinity
	});

	const bottomRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!bottomRef.current) return;
		const observer = new IntersectionObserver(([o]) => {
			if (!o?.isIntersecting || icons.isFetchingNextPage || !icons.hasNextPage)
				return;
			icons.fetchNextPage();
		});
		observer.observe(bottomRef.current);
		return () => observer.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bottomRef, icons.isFetchingNextPage, icons.hasNextPage]);

	return (
		<div
			className="grid max-h-[520px] gap-1 overflow-auto"
			style={{ gridTemplateColumns: 'repeat(8, 64px)' }}
		>
			{icons.isLoading && (
				<div className="col-span-8 flex h-32 items-center justify-center">
					<Spinner size={32} />
				</div>
			)}

			{!required && !icons.isLoading && (
				<TalentIcon
					showDefault
					icon=""
					selected={!icon}
					onClick={() => setIcon('')}
				/>
			)}

			{icons.data?.pages.map((page, index) => (
				<Fragment key={page.items[0]?.name ?? index}>
					{page.items.map(item => (
						<Icon key={item.name} icon={icon} setIcon={setIcon} item={item} />
					))}
				</Fragment>
			))}

			<div
				ref={bottomRef}
				className="col-span-8 flex h-16 items-center justify-center"
			>
				{icons.isFetchingNextPage && <Spinner size={32} />}
			</div>
		</div>
	);
};

export default IconGrid;
