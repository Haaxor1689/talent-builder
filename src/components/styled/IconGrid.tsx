'use client';

import { Fragment, useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import cls from 'classnames';

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
};

const IconGrid = ({ filter, icon, setIcon }: Props) => {
	const items = useInfiniteQuery({
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
		if (!bottomRef.current || items.isFetchingNextPage || !items.hasNextPage)
			return;
		const observer = new IntersectionObserver(([o]) => {
			if (!o?.isIntersecting) return;
			items.fetchNextPage();
		});
		observer.observe(bottomRef.current);
		return () => observer.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [items.isFetchingNextPage, items.hasNextPage]);

	return items.isLoading ? (
		<div className="flex h-135 grow items-center justify-center">
			<Spinner className="icon-size-8" />
		</div>
	) : !items.data?.pages[0]?.items?.length ? (
		<div className="text-blue-gray flex h-135 grow items-center justify-center">
			No results found
		</div>
	) : (
		<ScrollArea
			containerClassName="max-h-135"
			contentClassName="grid p-3 auto-rows-[64px] grid-cols-[repeat(auto-fit,64px)] gap-1"
		>
			{items.data?.pages.map((page, index) => (
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
				className={cls('col-span-full flex h-16 items-center justify-center', {
					hidden: !items.hasNextPage
				})}
			>
				<Spinner className="icon-size-8" />
			</div>
		</ScrollArea>
	);
};

export default IconGrid;
