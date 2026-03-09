'use client';

import { Fragment, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import ScrollArea from './ScrollArea';
import SpellIcon from './SpellIcon';
import Spinner from './Spinner';

type Props = {
	filter?: string;
	icon?: string;
	setIcon: (
		icon: string,
		event: React.MouseEvent<HTMLElement, MouseEvent>
	) => void;
	required?: boolean;
};

const IconGrid = ({ filter, required, icon, setIcon }: Props) => {
	const icons = useInfiniteQuery({
		queryKey: ['icons', filter],
		queryFn: async ({ pageParam }) => {
			const response = await fetch('/icons/list.json');
			const data: [number, string][] = await response.json();
			if (!data || !Array.isArray(data))
				throw new Error('Failed to fetch icons');

			const filtered = filter
				? data.filter(v =>
						v[1].toLocaleLowerCase().includes(filter.toLocaleLowerCase())
					)
				: data;
			const nextCursor = pageParam + 64;
			return {
				items: filtered.slice(pageParam, nextCursor),
				nextCursor: nextCursor <= filtered.length ? nextCursor : undefined
			};
		},
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
		<ScrollArea contentClassName="grid max-h-130 auto-rows-[64px] grid-cols-[repeat(auto-fit,64px)] gap-1 p-3">
			{icons.isLoading && (
				<div className="col-span-full flex h-32 items-center justify-center">
					<Spinner size={32} />
				</div>
			)}

			{!required && !icons.isLoading && (
				<SpellIcon showDefault selected={!icon} onClick={e => setIcon('', e)} />
			)}

			{icons.data?.pages.map((page, index) => (
				<Fragment key={page.items[0]?.[1] ?? index}>
					{page.items.map(item => (
						<SpellIcon
							key={item[1]}
							icon={item[1]}
							selected={icon === item[1]}
							onClick={e => setIcon(item[1], e)}
							title={`#${item[0]} ${item[1]}`}
						/>
					))}
				</Fragment>
			))}

			<div
				ref={bottomRef}
				className="col-span-full flex h-16 items-center justify-center"
			>
				{icons.isFetchingNextPage && <Spinner size={32} />}
			</div>
		</ScrollArea>
	);
};

export default IconGrid;
