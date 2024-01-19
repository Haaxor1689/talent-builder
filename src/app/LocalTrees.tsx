'use client';

import Link from 'next/link';

import { type TalentFormT } from '../server/api/types';

import TalentIcon from './_components/TalentIcon';
import useLocalStorage from './_components/hooks/useLocalStorage';
import Spinner from './_components/styled/Spinner';

const LocalTrees = () => {
	const [savedSpecs, _, loading] =
		useLocalStorage<Record<string, TalentFormT>>('saved-specs');

	if (loading) return <Spinner className="self-center" />;

	if (!Object.values(savedSpecs ?? {}).length) return null;

	return (
		<div className="flex flex-col gap-3">
			<h3 className="tw-color">Local only</h3>
			<div className="tw-surface flex flex-wrap justify-center gap-3">
				{Object.values(savedSpecs ?? {}).map(s => (
					<div key={s.id} className="flex w-[100px] flex-col rounded py-3">
						<Link href={`/${s.id}?local`} className="mx-auto">
							<TalentIcon icon={s.icon} showDefault clickable />
						</Link>
						<p className="truncate text-center">{s.name}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default LocalTrees;
