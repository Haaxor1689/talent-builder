'use client';

import Link from 'next/link';
import { CloudOff, ListFilter, Workflow } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { usePathname, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import {
	useEffect,
	useRef,
	Fragment,
	createContext,
	type PropsWithChildren,
	useContext,
	useState
} from 'react';

import {
	getLastUpdatedString,
	getTalentSum,
	maskToClass,
	zodResolver
} from '~/utils';
import { type talentTrees, type users } from '~/server/db/schema';
import { listInfiniteTalentTrees } from '~/server/api/routers/talentTree';
import { Filters } from '~/server/api/types';
import useDebounced from '~/hooks/useDebounced';

import SpellIcon from '../styled/SpellIcon';
import DialogButton from '../styled/DialogButton';
import Input from '../form/Input';
import ClassPicker from '../form/ClassPicker';
import Spinner from '../styled/Spinner';
import AuthorTag from '../styled/AuthorTag';
import Tooltip from '../styled/Tooltip';
import TextButton from '../styled/TextButton';

type TreePickContextValue = {
	open: (idx: number) => void;
};

const TreePickContext = createContext<TreePickContextValue>({
	open: () => {
		throw new Error('TreePickContext not provided');
	}
});

export const useTreePick = () => useContext(TreePickContext);

type Item = typeof talentTrees.$inferSelect & {
	idx: number;
	createdBy: typeof users.$inferSelect;
	close: () => void;
};

const GridItem = ({ idx, close, ...item }: Item) => {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const newSearch = new URLSearchParams({
		...Object.fromEntries(searchParams.entries()),
		[`t${idx}`]: item.id
	});

	const classInfo = maskToClass(item.class);

	return (
		<Tooltip
			tooltip={
				<div className="whitespace-nowrap">
					<h4 className="tw-color text-lg">{item.name}</h4>
					<p className="text-blueGray">
						Points: <span>{getTalentSum(item.talents)}</span>
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
								Author: <AuthorTag {...item.createdBy} />
							</div>
						</>
					)}
					{classInfo && (
						<p className="flex items-center gap-1 text-blueGray">
							Class:{' '}
							<SpellIcon icon={classInfo.icon} showDefault className="size-6" />{' '}
							<span style={{ color: classInfo.color }}>{classInfo.name}</span>
						</p>
					)}
				</div>
			}
			actions={() => (
				<TextButton
					icon={Workflow}
					type="link"
					href={`${pathname}?${newSearch}`}
					onClick={close}
				>
					Pick tree
				</TextButton>
			)}
		>
			<Link
				href={`${pathname}?${newSearch}`}
				className="tw-hocus -mb-2 flex items-center gap-3 p-2"
				prefetch={false}
				onClick={close}
			>
				<div className="relative flex shrink-0 items-center">
					<SpellIcon icon={item.icon} showDefault className="cursor-pointer" />
					{classInfo && (
						<div className="pointer-events-none absolute -bottom-4 -right-2">
							<SpellIcon icon={classInfo.icon} className="size-6" />
						</div>
					)}
				</div>
				<div className="flex flex-col gap-1 text-inherit">
					<p className="truncate text-lg text-inherit">{item.name}</p>
					{item.createdBy ? (
						<div className="flex items-center gap-1.5 truncate text-blueGray">
							<div
								className="size-6 shrink-0 rounded-full bg-contain"
								style={{
									backgroundImage: `url(${item.createdBy?.image}), url(https://cdn.discordapp.com/embed/avatars/0.png)`
								}}
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
		</Tooltip>
	);
};

const TreePickDialogProvider = ({ children }: PropsWithChildren) => {
	const [openIdx, setOpenIdx] = useState<number | null>(null);

	const calculatorClass = useWatch({ name: 'class' });

	const formProps = useForm({
		defaultValues: { class: calculatorClass },
		resolver: zodResolver(Filters)
	});
	const { register, watch, setValue, control } = formProps;

	useEffect(() => {
		setValue('class', calculatorClass);
	}, [calculatorClass, setValue]);

	const values = useDebounced(watch());

	const trees = useInfiniteQuery({
		queryKey: ['talentTrees', values],
		queryFn: ({ pageParam }) =>
			listInfiniteTalentTrees({
				...values,
				limit: 21,
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
			dialog={close => (
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
							<div className="col-span-full flex h-32 items-center justify-center">
								<Spinner size={32} />
							</div>
						)}

						{trees.data?.pages.map((page, index) => (
							<Fragment key={page.items[0]?.name ?? index}>
								{page.items.map(item => (
									<GridItem
										key={item.id}
										{...item}
										idx={openIdx ?? 0}
										close={close}
									/>
								))}
							</Fragment>
						))}

						<div
							ref={bottomRef}
							className="col-span-full flex h-16 items-center justify-center"
						>
							{trees.isFetchingNextPage && <Spinner size={32} />}
						</div>
					</div>
				</form>
			)}
		>
			{open => (
				<TreePickContext.Provider
					value={{
						open: idx => {
							setOpenIdx(idx);
							open();
						}
					}}
				>
					{children}
				</TreePickContext.Provider>
			)}
		</DialogButton>
	);
};

export default TreePickDialogProvider;
