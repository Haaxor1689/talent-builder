'use client';

import { type ComponentProps, Fragment, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { usePathname, useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import cls from 'classnames';
import { ListFilter } from 'lucide-react';

import TreeGridItem from '#components/styled/TreeGridItem.tsx';
import useDebounced from '#hooks/useDebounced.ts';
import { listInfiniteTalentTrees } from '#server/api/talentTree.actions.ts';
import { TreesFilters } from '#server/schemas.ts';
import { invoke, zodResolver } from '#utils/index.ts';

import Input from '../form/Input';
import Dialog, { closeDialog } from '../styled/Dialog';
import ScrollArea from '../styled/ScrollArea';
import Spinner from '../styled/Spinner';

type Props = {
	idx: number;
	trigger: ComponentProps<typeof Dialog>['trigger'];
};

const TreePickDialog = ({ idx, trigger }: Props) => {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const calculatorClass = useWatch({ name: 'class' });
	const calculatorRows = useWatch({ name: 'rows' });

	const { register, watch } = useForm({ resolver: zodResolver(TreesFilters) });
	const values = useDebounced(watch());

	const items = useInfiniteQuery({
		queryKey: [
			'talentTrees',
			{ ...values, class: calculatorClass, rows: calculatorRows }
		] as const,
		queryFn: ({ queryKey, pageParam }) =>
			invoke(
				listInfiniteTalentTrees({
					...queryKey[1],
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

	return (
		<Dialog
			trigger={trigger}
			unstyled
			className="haax-surface-0 w-full! max-w-[min(calc(100%-1rem),var(--container-5xl))]"
		>
			<div className="flex flex-col items-stretch gap-2 p-3 md:flex-row md:items-center">
				<div className="flex grow items-center justify-between gap-2">
					<ListFilter size={26} />
					<Input
						{...register('name')}
						placeholder="Name"
						className="grow md:mr-2"
					/>
				</div>
				<Input {...register('from')} placeholder="From" />
			</div>

			<hr />

			{items.isLoading ? (
				<div className="flex h-135 grow items-center justify-center">
					<Spinner className="icon-size-8" />
				</div>
			) : !items.data?.pages[0]?.items?.length ? (
				<div className="flex h-135 grow items-center justify-center text-blue-gray">
					No results found
				</div>
			) : (
				<ScrollArea
					containerClassName="max-h-135"
					contentClassName="grid items-start gap-3 p-3 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
				>
					{items.data?.pages.map((page, index) => (
						<Fragment key={page.items[0]?.name ?? index}>
							{page.items.map(item => (
								<TreeGridItem
									key={item.id}
									item={item}
									href={`${pathname}?${new URLSearchParams({
										...Object.fromEntries(searchParams.entries()),
										[`t${idx}`]: item.id
									})}`}
									onClick={closeDialog}
									label="Pick tree"
								/>
							))}
						</Fragment>
					))}

					<div
						ref={bottomRef}
						className={cls(
							'col-span-full flex h-16 items-center justify-center',
							{ hidden: !items.hasNextPage }
						)}
					>
						<Spinner className="icon-size-8" />
					</div>
				</ScrollArea>
			)}
		</Dialog>
	);
};

export default TreePickDialog;
