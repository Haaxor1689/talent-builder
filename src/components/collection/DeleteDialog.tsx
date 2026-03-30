'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWatch } from 'react-hook-form';

import Dialog from '#components/styled/Dialog.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import useAsyncAction from '#hooks/useAsyncAction.tsx';
import { deleteCollection } from '#server/api/collection.actions.ts';
import { type CollectionForm } from '#server/schemas.ts';
import { invoke } from '#utils/index.ts';

const DeleteDialog = () => {
	const [isPending, startTransition] = useAsyncAction();
	const router = useRouter();

	const id = useWatch<CollectionForm, 'id'>({ name: 'id' });
	const name = useWatch<CollectionForm, 'name'>({ name: 'name' });

	return (
		<Dialog
			trigger={open => (
				<TextButton
					onClick={open}
					icon={<Trash2 />}
					title="Delete"
					className="text-red"
				/>
			)}
		>
			<h3 className="haax-color">Delete collection?</h3>
			<hr />
			<p className="text-blue-gray">
				Are you sure you want to delete <span>&quot;{name}&quot;</span>{' '}
				collection?
			</p>
			<p className="text-blue-gray">This action cannot be undone!</p>
			<hr />
			<div className="-m-2 flex justify-end gap-2">
				<TextButton
					icon={<Trash2 />}
					loading={isPending}
					onClick={startTransition(async () => {
						await invoke(deleteCollection({ id }));

						if (window.history.length > 1) router.back();
						else router.push('/');
					})}
					className="text-red"
				>
					Delete
				</TextButton>
			</div>
		</Dialog>
	);
};

export default DeleteDialog;
