'use client';

import { type ReactNode } from 'react';
import cls from 'classnames';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import NoResults from './NoResults';

type Tab = {
	title: string;
	count?: number;
	component: ReactNode;
};

export type TabsList = Record<string, Tab>;

type Props = {
	tabs: TabsList;
	noTabsContent?: ReactNode;
};

const Tabs = ({ tabs, noTabsContent }: Props) => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	const current = searchParams.get('tab') ?? Object.entries(tabs)[0]?.[0];

	const setCurrent = (tab: string | null) => {
		const params = new URLSearchParams(searchParams);

		if (tab) params.set('tab', tab);
		else params.delete('tab');

		params.delete('page');
		params.delete('pageSize');
		params.delete('sort');

		router.push(`${pathname}?${params}`);
	};

	const tabArray = Object.entries(tabs);

	return (
		<div className="flex flex-row items-stretch gap-2">
			<div className="flex flex-col gap-2 py-3">
				{tabArray.map(([key, tab]) => (
					<div
						key={key}
						className={cls(
							'tw-surface -mr-2 border-r-0 p-0',
							current === key && 'bg-darkGray'
						)}
					>
						<button
							onClick={() => setCurrent(key)}
							className={cls(
								'tw-hocus tw-color block w-[48px] px-2 py-3 font-fontin text-2xl uppercase'
							)}
							style={{ textOrientation: 'mixed', writingMode: 'vertical-rl' }}
						>
							{tab.title}
							{!!tab.count && ` (${tab.count})`}
						</button>
					</div>
				))}
			</div>
			{!tabArray.length
				? noTabsContent ?? <NoResults />
				: tabs[current as never]?.component ?? <NoResults />}
		</div>
	);
};

export default Tabs;
