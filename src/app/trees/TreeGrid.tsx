'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import cls from 'classnames';
import { useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useMemo, useRef } from 'react';

import Spinner from '#components/styled/Spinner.tsx';
import TreeGridItem from '#components/styled/TreeGridItem.tsx';
import { listInfiniteTalentTrees } from '#server/api/talentTree.actions.ts';
import { TreesFilters } from '#server/schemas.ts';
import { invoke } from '#utils/index.ts';

const TreeGrid = () => {
	const searchParams = useSearchParams();
	const defaultValues = useMemo(() => {
		const p = TreesFilters.safeParse({
			...Object.fromEntries(searchParams.entries())
		});
		return p.success ? p.data : TreesFilters.parse({});
	}, [searchParams]);

	const trees = useInfiniteQuery({
		queryKey: ['talentTrees', defaultValues],
		queryFn: ({ pageParam }) =>
			invoke(
				listInfiniteTalentTrees({
					...defaultValues,
					limit: 15,
					cursor: pageParam
				})
			),
		initialPageParam: 0,
		getNextPageParam: prev => prev.nextCursor,
		staleTime: Infinity
	});

	const bottomRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!bottomRef.current || trees.isFetchingNextPage || !trees.hasNextPage)
			return;
		const observer = new IntersectionObserver(([o]) => {
			if (!o?.isIntersecting) return;
			trees.fetchNextPage();
		});
		observer.observe(bottomRef.current);
		return () => observer.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trees.isFetchingNextPage, trees.hasNextPage]);

	if (trees.isLoading)
		return (
			<div className="haax-surface-6 grow items-center justify-center text-center text-blue-gray">
				<Spinner className="icon-size-8" />
			</div>
		);

	if (!trees.data?.pages[0]?.items.length)
		return (
			<div className="haax-surface-6 grow items-center justify-center text-center text-blue-gray">
				No results found
			</div>
		);

	return (
		<div className="haax-surface-3 grid items-start md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]">
			{trees.data?.pages.map((page, index) => (
				<Fragment key={page.items[0]?.id ?? index}>
					{page.items.map(item => (
						<TreeGridItem
							key={item.id}
							item={item}
							href={`/tree/${item.slug ?? item.id}`}
						/>
					))}
				</Fragment>
			))}

			<div
				ref={bottomRef}
				className={cls('col-span-full flex h-16 items-center justify-center', {
					hidden: !trees.hasNextPage
				})}
			>
				<Spinner className="icon-size-8" />
			</div>
		</div>
	);
};

export default TreeGrid;
