'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import cls from 'classnames';
import { useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useMemo, useRef } from 'react';

import CollectionGridItem from '#components/styled/CollectionGridItem.tsx';
import Spinner from '#components/styled/Spinner.tsx';
import { listInfiniteCollections } from '#server/api/collection.actions.ts';
import { CollectionsFilters } from '#server/schemas.ts';
import { invoke } from '#utils/index.ts';

const CollectionsGrid = () => {
	const searchParams = useSearchParams();
	const defaultValues = useMemo(() => {
		const p = CollectionsFilters.safeParse({
			...Object.fromEntries(searchParams.entries())
		});
		return p.success ? p.data : CollectionsFilters.parse({});
	}, [searchParams]);

	const collections = useInfiniteQuery({
		queryKey: ['collections', defaultValues],
		queryFn: ({ pageParam }) =>
			invoke(
				listInfiniteCollections({
					...defaultValues,
					limit: 42,
					cursor: pageParam
				})
			),
		initialPageParam: 0,
		getNextPageParam: prev => prev.nextCursor,
		staleTime: Infinity
	});

	const bottomRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (
			!bottomRef.current ||
			collections.isFetchingNextPage ||
			!collections.hasNextPage
		)
			return;
		const observer = new IntersectionObserver(([o]) => {
			if (!o?.isIntersecting) return;
			collections.fetchNextPage();
		});
		observer.observe(bottomRef.current);
		return () => observer.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [collections.isFetchingNextPage, collections.hasNextPage]);

	if (collections.isLoading)
		return (
			<div className="haax-surface-6 grow items-center justify-center text-center text-blue-gray">
				<Spinner className="icon-size-8" />
			</div>
		);

	if (!collections.data?.pages[0]?.items.length)
		return (
			<div className="haax-surface-6 grow items-center justify-center text-center text-blue-gray">
				No collections found
			</div>
		);

	return (
		<div className="haax-surface-3 grid items-start md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]">
			{collections.data?.pages.map((page, index) => (
				<Fragment key={page.items[0]?.id ?? index}>
					{page.items.map(item => (
						<CollectionGridItem
							key={item.id}
							item={item}
							href={`/collections/${item.slug ?? item.id}`}
						/>
					))}
				</Fragment>
			))}

			<div
				ref={bottomRef}
				className={cls('col-span-full flex h-16 items-center justify-center', {
					hidden: !collections.hasNextPage
				})}
			>
				<Spinner className="icon-size-8" />
			</div>
		</div>
	);
};

export default CollectionsGrid;
