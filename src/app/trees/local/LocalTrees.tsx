'use client';

import { useSearchParams } from 'next/navigation';

import TalentBuilder from '#components/builder/TalentBuilder.tsx';
import Loading from '#components/layout/Loading.tsx';
import TreeGridItem from '#components/styled/TreeGridItem.tsx';
import useLocalTrees from '#hooks/useLocalTrees.ts';

const LocalTrees = () => {
	const searchParams = useSearchParams();
	const { localTrees } = useLocalTrees();
	const trees = Object.values(localTrees ?? {});
	const selected = searchParams.get('tree');

	if (!localTrees) return <Loading />;
	return (
		<>
			{selected && localTrees?.[selected] && (
				<TalentBuilder key={selected} defaultValues={localTrees[selected]} />
			)}
			<h2 className="-mb-3 haax-color text-center md:text-left">Local Trees</h2>
			{trees.length ? (
				<div className="haax-surface-3 grid items-start md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]">
					{trees.map(tree => (
						<TreeGridItem
							key={tree.id}
							item={tree}
							href={`/local?tree=${tree.id}`}
							active={tree.id === selected}
							label="Open local tree"
						/>
					))}
				</div>
			) : (
				<div className="haax-surface-6 flex min-h-24 items-center justify-center text-center text-blue-gray">
					No local trees found.
				</div>
			)}
		</>
	);
};

export default LocalTrees;
