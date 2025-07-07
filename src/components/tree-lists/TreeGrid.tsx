'use client';

import { useSession } from 'next-auth/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Fragment, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import { Filters, type FiltersT } from '~/server/api/types';
import Spinner from '~/components/styled/Spinner';
import useLocalTrees from '~/hooks/useLocalTrees';
import { listInfiniteTalentTrees } from '~/server/api/routers/talentTree';

import NoResults from '../NoResults';

import TreeGridItem from './TreeGridItem';

type Props = {
	limit?: number;
	local?: boolean;
	values?: Partial<FiltersT>;
};

const TreeGrid = ({ limit = 12, local, values }: Props) => {
	const [savedSpecs, _, loading] = useLocalTrees();

	const session = useSession();

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
				limit,
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
	}, [bottomRef, trees.isFetchingNextPage, trees.hasNextPage]);

	if (trees.isLoading || loading || session.status === 'loading')
		return (
			<div className="tw-surface flex grow items-center justify-center p-2 md:p-4">
				<Spinner className="my-6" />
			</div>
		);

	const localFiltered = local
		? Object.values(savedSpecs ?? {}).filter(
				v =>
					(!defaultValues.name || v.name.match(defaultValues.name)) &&
					(!defaultValues.from ||
						session.data?.user.name?.match(defaultValues.from)) &&
					(!defaultValues.class || v.class === defaultValues.class)
		  )
		: [];

	if (!trees.data?.pages[0]?.items.length && !localFiltered.length)
		return <NoResults />;

	return (
		<div className="tw-surface grow p-2 md:p-4">
			<div
				className="grid items-start gap-3"
				style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}
			>
				{trees.isLoading && (
					<div className="col-span-full flex h-32 items-center justify-center">
						<Spinner size={32} />
					</div>
				)}

				{localFiltered.map(item => (
					<TreeGridItem
						key={item.id}
						{...item}
						href={`/local/${item.id}`}
						createdBy={null as never}
						createdById={null as never}
						createdAt={null as never}
					/>
				))}

				{trees.data?.pages.map((page, index) => (
					<Fragment key={page.items[0]?.id ?? index}>
						{page.items.map(item => (
							<TreeGridItem key={item.id} {...item} href={`/tree/${item.id}`} />
						))}
					</Fragment>
				))}

				{trees.hasNextPage && (
					<div
						ref={bottomRef}
						className="col-span-full flex h-16 items-center justify-center"
					>
						{trees.isFetchingNextPage && <Spinner size={32} />}
					</div>
				)}
			</div>
		</div>
	);
};

export default TreeGrid;
