'use client';

import Link from 'next/link';
import { CloudOff, ListFilter } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { usePathname, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, type ReactElement, Fragment } from 'react';

import { getTalentSum, maskToClass, zodResolver } from '~/utils';
import { type talentTrees, type users } from '~/server/db/schema';
import { listInfiniteTalentTrees } from '~/server/api/routers/talentTree';
import { Filters } from '~/server/api/types';

import TalentIcon from '../styled/TalentIcon';
import useTooltip from '../hooks/useTooltip';
import DialogButton from '../styled/DialogButton';
import Input from '../form/Input';
import ClassPicker from '../form/ClassPicker';
import useDebounced from '../hooks/useDebounced';
import Spinner from '../styled/Spinner';

const getLastUpdatedString = (date: Date) => {
	if (!date) return 'Never';
	const now = new Date();
	const diff = now.getTime() - new Date(date).getTime();
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor(diff / (1000 * 60));
	const seconds = Math.floor(diff / 1000);
	const plural = (n: number) => (n === 1 ? '' : 's');
	if (days > 0) return `${days} day${plural(days)} ago`;
	if (hours > 0) return `${hours} hour${plural(hours)} ago`;
	if (minutes > 0) return `${minutes} minute${plural(minutes)} ago`;
	return `${seconds} second${plural(seconds)} ago`;
};

type Item = typeof talentTrees.$inferSelect & {
	idx: number;
	createdBy: typeof users.$inferSelect;
};

const GridItem = ({ idx, ...item }: Item) => {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const newSearch = new URLSearchParams({
		...Object.fromEntries(searchParams.entries()),
		[`t${idx}`]: item.id
	});

	const { elementProps, tooltipProps } = useTooltip();
	const classInfo = maskToClass(item.class);

	return (
		<>
			<Link
				href={`${pathname}?${newSearch}`}
				className="tw-hocus -mb-2 flex items-center gap-3 p-2"
				{...elementProps}
			>
				<div className="relative flex shrink-0 items-center">
					<TalentIcon icon={item.icon} showDefault className="cursor-pointer" />
					{classInfo && (
						<div className="pointer-events-none absolute -bottom-4 -right-2">
							<TalentIcon icon={classInfo.icon} className="size-6" />
						</div>
					)}
				</div>
				<div className="flex flex-col gap-1 text-inherit">
					<p className="truncate text-lg text-inherit">{item.name}</p>
					{item.createdBy ? (
						<div className="flex items-center gap-1.5 truncate text-blueGray">
							<div
								className="size-6 shrink-0 rounded-full bg-contain"
								style={{ backgroundImage: `url(${item.createdBy?.image})` }}
							/>
							{item.createdBy.name === 'TurtleWoW'
								? 'TurtleWoW'
								: getLastUpdatedString(item.updatedAt ?? item.createdAt)}
						</div>
					) : (
						<div className="flex items-center gap-1.5 text-blueGray">
							<CloudOff size={24} />
							Local only
						</div>
					)}
				</div>
			</Link>
			<div
				className="tw-surface max-w-[400px] bg-darkerGray/90"
				{...tooltipProps}
			>
				<h4 className="tw-color text-lg">{item.name}</h4>
				<p className="text-blueGray">
					Points: <span>{getTalentSum(item.tree)}</span>
				</p>
				{item.createdBy && (
					<>
						<span className="text-blueGray">
							Last updated:{' '}
							<span>
								{new Date(item.updatedAt ?? item.createdAt).toLocaleString(
									'en-US'
								)}
							</span>
						</span>
						<div className="flex items-center gap-1.5 text-blueGray">
							Author:
							<div
								className="size-7 rounded-full bg-contain"
								style={{ backgroundImage: `url(${item.createdBy?.image})` }}
							/>
							<span>{item.createdBy?.name}</span>
						</div>
					</>
				)}
				{classInfo && (
					<p className="flex items-center gap-1 text-blueGray">
						Class:{' '}
						<TalentIcon icon={classInfo.icon} showDefault className="size-6" />{' '}
						<span style={{ color: classInfo.color }}>{classInfo.name}</span>
					</p>
				)}
			</div>
		</>
	);
};

type Props = {
	idx: number;
	children: (open: () => void) => ReactElement;
};

const TreePickDialog = ({ idx, children }: Props) => {
	const formProps = useForm({
		resolver: zodResolver(Filters)
	});
	const { register, watch, control } = formProps;

	const values = useDebounced(watch());

	const trees = useInfiniteQuery({
		queryKey: ['talentTrees', values],
		queryFn: ({ pageParam = 0 }) =>
			listInfiniteTalentTrees({
				...values,
				limit: 21,
				cursor: pageParam
			}),
		getNextPageParam: prev => prev.nextCursor,
		staleTime: Infinity
	});

	const bottomRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!bottomRef.current) return;
		const observer = new IntersectionObserver(([o]) => {
			if (!o?.isIntersecting || trees.isFetchingNextPage || !trees.hasNextPage)
				return;
			trees.fetchNextPage();
		});
		observer.observe(bottomRef.current);
		return () => observer.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bottomRef, trees.isFetchingNextPage, trees.hasNextPage]);

	return (
		<DialogButton
			clickAway
			dialog={() => (
				<form className="tw-surface max-w-screen-lg grow bg-darkerGray/90 p-0">
					<div className="flex flex-col items-stretch gap-2 p-3 md:flex-row md:items-center">
						<div className="flex grow items-center justify-between gap-2">
							<ListFilter size={26} className="shrink-0" />
							<Input
								{...register('name')}
								placeholder="Name"
								className="grow md:mr-2"
							/>
						</div>
						<div className="flex items-center justify-between gap-2">
							<Input
								{...register('from')}
								placeholder="From"
								className="grow"
							/>
							<ClassPicker name="class" control={control} />
						</div>
					</div>

					<hr className="!mx-0" />

					<div
						className="grid max-h-[520px] items-start gap-3 overflow-auto p-2 md:p-4"
						style={{
							gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
						}}
					>
						{trees.isLoading && (
							<div className="col-span-3 flex h-32 items-center justify-center">
								<Spinner size={32} />
							</div>
						)}

						{trees.data?.pages.map((page, index) => (
							<Fragment key={page.items[0]?.name ?? index}>
								{page.items.map(item => (
									<GridItem key={item.id} {...item} idx={idx} />
								))}
							</Fragment>
						))}

						<div
							ref={bottomRef}
							className="col-span-3 flex h-16 items-center justify-center"
						>
							{trees.isFetchingNextPage && <Spinner size={32} />}
						</div>
					</div>
				</form>
			)}
		>
			{children}
		</DialogButton>
	);
};

export default TreePickDialog;
