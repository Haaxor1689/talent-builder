'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LibraryBig, Link, Unlink } from 'lucide-react';
import { useWatch } from 'react-hook-form';

import CollectionGridItem from '#components/styled/CollectionGridItem.tsx';
import Dialog from '#components/styled/Dialog.tsx';
import ScrollArea from '#components/styled/ScrollArea.tsx';
import Spinner from '#components/styled/Spinner.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import useAsyncAction from '#hooks/useAsyncAction.tsx';
import useIsSupporter from '#hooks/useIsSupporter.tsx';
import {
	addCollectionTree,
	listEditableCollections,
	listTreeCollections,
	removeCollectionTree
} from '#server/api/collection.actions.ts';
import { invoke } from '#utils/index.ts';

const CollectionsDialog = () => {
	const [isPending, startTransition] = useAsyncAction();

	const treeId = useWatch({ name: 'id' });
	const { isSupporter, supportCta } = useIsSupporter('Collections management');

	const queryClient = useQueryClient();

	const relations = useQuery({
		queryKey: ['tree-relations', treeId],
		queryFn: () => invoke(listTreeCollections({ treeId })),
		enabled: false
	});

	const editable = useQuery({
		queryKey: ['editable-collections'],
		queryFn: () => invoke(listEditableCollections()),
		enabled: false
	});

	return (
		<Dialog
			trigger={open => (
				<TextButton
					icon={<LibraryBig />}
					title="Collections"
					onClick={() => {
						open();
						if (!relations.data && !relations.isFetching) relations.refetch();
						if (isSupporter && !editable.data && !editable.isFetching)
							editable.refetch();
					}}
				/>
			)}
			className="w-full!"
		>
			<h3 className="haax-color">Included in collections</h3>
			<hr />

			{relations.isLoading || relations.isFetching ? (
				<Spinner className="my-6 self-center" />
			) : !relations.data?.length ? (
				<p className="text-blue-gray">
					This tree is not included in any collections visible to you.
				</p>
			) : (
				<ScrollArea
					containerClassName="-m-3 min-h-24"
					contentClassName="grid items-start md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-3 p-3"
				>
					{relations.data?.map(({ collection }) => (
						<div
							key={collection.id}
							className="flex items-center justify-between gap-1"
						>
							<CollectionGridItem
								item={collection}
								href={`/collections/${collection.id}`}
							/>
							{editable.data?.some(c => c.id === collection.id) ? (
								<TextButton
									icon={<Unlink />}
									onClick={startTransition(async () => {
										await invoke(
											removeCollectionTree({
												collectionId: collection.id,
												treeId
											})
										);

										queryClient.setQueryData<typeof relations.data>(
											['tree-relations', treeId],
											prev =>
												(prev ?? []).filter(
													r => r.collectionId !== collection.id
												)
										);
									})}
									loading={isPending}
									className="text-red"
								>
									Remove
								</TextButton>
							) : null}
						</div>
					))}
				</ScrollArea>
			)}
			<hr />
			<h4 className="haax-color">Add to collection</h4>
			<hr />
			{supportCta}
			{isSupporter &&
				(editable.isLoading || editable.isFetching ? (
					<Spinner className="my-6 self-center" />
				) : !editable.data?.length ? (
					<p className="text-blue-gray">
						You don&apos;t have permission to edit any collections.
					</p>
				) : (
					<ScrollArea
						containerClassName="-m-3 min-h-24"
						contentClassName="grid items-start md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-3 p-3"
					>
						<p className="col-start-1 -col-end-1 text-blue-gray">
							You can add this tree to any collection you have permission to
							edit, or remove it from collections you have permission to edit
							that it is already in.
						</p>
						{editable.data
							?.filter(c => !relations.data?.some(r => r.collectionId === c.id))
							.map(collection => (
								<div
									key={collection.id}
									className="flex items-center justify-between gap-1"
								>
									<CollectionGridItem
										item={collection}
										href={`/collections/${collection.id}`}
									/>
									<TextButton
										icon={<Link />}
										onClick={startTransition(async () => {
											await invoke(
												addCollectionTree({
													collectionId: collection.id,
													treeId
												})
											);
											queryClient.setQueryData<typeof relations.data>(
												['tree-relations', treeId],
												prev => [
													...(prev ?? []),
													{
														treeId,
														collectionId: collection.id,
														collection: collection as never
													}
												]
											);
										})}
										loading={isPending}
										className="text-green"
									>
										Add
									</TextButton>
								</div>
							))}
					</ScrollArea>
				))}
		</Dialog>
	);
};

export default CollectionsDialog;
