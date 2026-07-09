'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { type ReactNode, useCallback, useEffect, useState } from 'react';

type Props = {
	title: ReactNode;
	storageKey?: string;
	children: ReactNode;
};

const CollapsibleSection = ({ title, storageKey, children }: Props) => {
	const [collapsed, setCollapsed] = useState(true);

	const saveState = useCallback(
		(next: boolean) => {
			window.localStorage.setItem(
				`instructions:${storageKey}`,
				JSON.stringify(next)
			);
		},
		[storageKey]
	);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const stored = window.localStorage.getItem(`instructions:${storageKey}`);
		if (!stored) {
			// First visit for this page/user: auto-open after hydration.
			setCollapsed(false);
			saveState(false);
			return;
		}
		setCollapsed(stored === 'true');
	}, [storageKey, saveState]);

	return (
		<section className="haax-surface-6">
			<details
				open={!collapsed}
				onToggle={e => {
					const nextCollapsed = !e.currentTarget.open;
					setCollapsed(nextCollapsed);
					saveState(nextCollapsed);
				}}
			>
				<summary className="flex cursor-pointer items-center gap-2 text-left hocus:haax-highlight">
					{title}
					{collapsed ? <ChevronRight /> : <ChevronDown />}
				</summary>
				<div
					aria-hidden={collapsed}
					className="mt-6 flex flex-col gap-2 text-blue-gray"
				>
					{children}
				</div>
			</details>
		</section>
	);
};

export default CollapsibleSection;
