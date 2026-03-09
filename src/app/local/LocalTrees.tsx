'use client';

import { useSearchParams } from 'next/navigation';

import TalentBuilder from '#components/builder/TalentBuilder.tsx';
import TreeGridItem from '#components/styled/TreeGridItem.tsx';
import useLocalTrees from '#hooks/useLocalTrees.ts';

const LocalTrees = () => {
	const searchParams = useSearchParams();
	const [localTrees] = useLocalTrees();
	const trees = Object.values(localTrees ?? {});
	const selected = searchParams.get('tree');

	if (selected && localTrees?.[selected])
		return <TalentBuilder defaultValues={localTrees[selected]} isLocal />;

	return (
		<>
			<h2 className="haax-color -mb-3 text-center md:text-left">Local Trees</h2>
			{trees.length ? (
				<div className="haax-surface-3 grid items-start md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]">
					{trees.map(tree => (
						<TreeGridItem
							key={tree.id}
							id={tree.id}
							name={tree.name}
							icon={tree.icon}
							class={tree.class}
							index={tree.index}
							public={tree.public}
							notes={tree.notes}
							talents={tree.talents}
							collection={tree.collection}
							createdAt={tree.createdAt ?? new Date(0)}
							updatedAt={tree.updatedAt}
							createdById={tree.createdById ?? 'local'}
							href={`/local?tree=${tree.id}`}
							createdBy={null}
							label="Open local tree"
						/>
					))}
				</div>
			) : (
				<div className="haax-surface-6 text-blue-gray flex min-h-24 items-center justify-center text-center">
					No local trees found.
				</div>
			)}
		</>
	);
};

export default LocalTrees;
