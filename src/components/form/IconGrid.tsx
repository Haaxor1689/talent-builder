'use client';

import { Fragment, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { listIcons } from '~/server/api/routers/icon';

import TalentIcon from '../styled/TalentIcon';
import Spinner from '../styled/Spinner';

type IconProps = {
	item: { name: string; data: string };
	icon?: string;
	setIcon: (icon: string) => void;
};

const Icon = ({ item, icon, setIcon }: IconProps) => (
	<TalentIcon
		icon={item.name}
		selected={icon === item.name}
		onClick={() => setIcon(item.name)}
	/>
);

type Props = {
	filter?: string;
	icon?: string;
	setIcon: (icon: string) => void;
	required?: boolean;
};

const IconGrid = ({ filter, required, icon, setIcon }: Props) => {
	const icons = useInfiniteQuery({
		queryKey: ['icons', filter],
		queryFn: async ({ pageParam }) =>
			await listIcons({
				limit: 64,
				filter,
				cursor: pageParam
			}),
		initialPageParam: 0,
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
			className="grid max-h-[520px] gap-1 overflow-y-auto"
			style={{ gridTemplateColumns: 'repeat(auto-fit, 64px)' }}
		>
			{icons.isLoading && (
				<div className="col-span-full flex h-32 items-center justify-center">
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
				className="col-span-full flex h-16 items-center justify-center"
			>
				{icons.isFetchingNextPage && <Spinner size={32} />}
			</div>
		</div>
	);
};

export default IconGrid;