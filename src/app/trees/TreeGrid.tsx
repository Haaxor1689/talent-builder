'use client';

import { Fragment, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import cls from 'classnames';

import Spinner from '#components/styled/Spinner.tsx';
import { listInfiniteTalentTrees } from '#server/api/routers/talentTree.ts';
import { Filters, type FiltersT } from '#server/api/types.ts';

import TreeGridItem from './TreeGridItem';

type Props = { values?: Partial<FiltersT> };

const TreeGrid = ({ values }: Props) => {
	const searchParams = useSearchParams();
	const defaultValues = useMemo(() => {
		const p = Filters.safeParse({
			...values,
			...Object.fromEntries(searchParams.entries())
		});
		return p.success ? p.data : Filters.parse({});
	}, [values, searchParams]);

	const trees = useInfiniteQuery({
		queryKey: ['talentTrees', defaultValues],
		queryFn: ({ pageParam }) =>
			listInfiniteTalentTrees({
				...defaultValues,
				limit: 42,
				cursor: pageParam
			}),
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
			<div className="haax-surface-6 text-blue-gray grow items-center justify-center text-center">
				<Spinner size={48} />
			</div>
		);

	if (!trees.data?.pages[0]?.items.length)
		return (
			<div className="haax-surface-6 text-blue-gray grow items-center justify-center text-center">
				No results found
			</div>
		);

	return (
		<div className="haax-surface-3 grid items-start md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]">
			{trees.data?.pages.map((page, index) => (
				<Fragment key={page.items[0]?.id ?? index}>
					{page.items.map(item => (
						<TreeGridItem key={item.id} {...item} href={`/tree/${item.id}`} />
					))}
				</Fragment>
			))}

			<div
				ref={bottomRef}
				className={cls('col-span-full flex h-16 items-center justify-center', {
					hidden: !trees.hasNextPage
				})}
			>
				<Spinner size={32} />
			</div>
		</div>
	);
};

export default TreeGrid;
