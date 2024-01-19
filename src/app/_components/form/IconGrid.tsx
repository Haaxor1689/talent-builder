'use client';

import { Fragment, useEffect, useRef } from 'react';

import { api } from '~/trpc/react';

import TalentIcon from '../TalentIcon';
import Spinner from '../styled/Spinner';
import Tooltip from '../styled/Tooltip';

type Props = {
	filter?: string;
	icon?: string;
	setIcon: (icon?: string) => void;
	required?: boolean;
};

const IconGrid = ({ filter, required, icon, setIcon }: Props) => {
	const icons = api.icon.list.useInfiniteQuery(
		{ limit: 64, filter },
		{ getNextPageParam: prev => prev.nextCursor, staleTime: Infinity }
	);

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
	}, [bottomRef, icons.isFetchingNextPage, icons.hasNextPage]);

	return (
		<div className="grid max-h-[520px] grid-cols-8 gap-1 overflow-auto">
			{!required && (
				<TalentIcon
					showDefault
					selected={!icon}
					onClick={() => setIcon(undefined)}
				/>
			)}
			{icons.data?.pages.map((page, index) => (
				<Fragment key={page.items[0]?.name ?? index}>
					{page.items.map(item => (
						<Tooltip
							key={item.name}
							tooltip={
								<div className="tw-surface left-5 top-5 max-w-[400px] bg-darkerGray/90">
									{item.name}
								</div>
							}
						>
							<TalentIcon
								icon={item.name}
								selected={icon === item.name}
								onClick={() => setIcon(item.name)}
							/>
						</Tooltip>
					))}
				</Fragment>
			))}

			<div
				ref={bottomRef}
				className="col-span-8 flex h-16 items-center justify-center"
			>
				{icons.isFetchingNextPage && <Spinner size={32} />}
			</div>
		</div>
	);
};

export default IconGrid;
