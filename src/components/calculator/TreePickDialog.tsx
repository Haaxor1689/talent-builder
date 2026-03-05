'use client';

import { type ComponentProps, Fragment, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { usePathname, useSearchParams } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import cls from 'classnames';
import { ListFilter } from 'lucide-react';

import TreeGridItem from '#app/trees/TreeGridItem.tsx';
import useDebounced from '#hooks/useDebounced.ts';
import { listInfiniteTalentTrees } from '#server/api/talentTree.actions.ts';
import { Filters } from '#server/schemas.ts';
import { zodResolver } from '#utils/index.ts';

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

	const formProps = useForm({
		resolver: zodResolver(Filters)
	});
	const { register, watch } = formProps;

	const values = useDebounced(watch());

	const trees = useInfiniteQuery({
		queryKey: ['talentTrees', { ...values, class: calculatorClass }] as const,
		queryFn: ({ queryKey, pageParam }) =>
			listInfiniteTalentTrees({ ...queryKey[1], limit: 42, cursor: pageParam }),
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

	return (
		<Dialog
			trigger={trigger}
			unstyled
			className="haax-surface-0 w-full max-w-5xl"
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

			{trees.isLoading ? (
				<div className="flex h-135 grow items-center justify-center">
					<Spinner size={32} />
				</div>
			) : !trees.data?.pages[0]?.items?.length ? (
				<div className="text-blue-gray flex h-135 grow items-center justify-center">
					No results found
				</div>
			) : (
				<ScrollArea
					containerClassName="max-h-135"
					contentClassName="grid items-start gap-3 p-3 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]"
				>
					{trees.data?.pages.map((page, index) => (
						<Fragment key={page.items[0]?.name ?? index}>
							{page.items.map(item => (
								<TreeGridItem
									key={item.id}
									{...item}
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
							{ hidden: !trees.hasNextPage }
						)}
					>
						<Spinner size={32} />
					</div>
				</ScrollArea>
			)}
		</Dialog>
	);
};

export default TreePickDialog;
