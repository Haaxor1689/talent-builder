'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

import Dialog from '#components/styled/Dialog.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import useAsyncAction from '#hooks/useAsyncAction.tsx';
import useLocalTrees from '#hooks/useLocalTrees.ts';
import { deleteTalentTree } from '#server/api/talentTree.actions.ts';
import { type TalentForm } from '#server/schemas.ts';
import { invoke } from '#utils/index.ts';

const DeleteDialog = () => {
	const [isPending, startTransition] = useAsyncAction();
	const router = useRouter();
	const { deleteTree } = useLocalTrees();
	const { getValues } = useFormContext<TalentForm>();
	const name = useWatch({ name: 'name' });

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
			<h3 className="haax-color">Delete tree?</h3>
			<hr />
			<p className="text-blue-gray">
				Are you sure you want to delete <span>&quot;{name}&quot;</span> tree?
			</p>
			<p className="text-blue-gray">This action cannot be undone!</p>
			<hr />
			<div className="-m-2 flex justify-end gap-2">
				<TextButton
					icon={<Trash2 />}
					loading={isPending}
					onClick={startTransition(async () => {
						const values = getValues();

						if (values.createdById === null) deleteTree(values.id);
						else await invoke(deleteTalentTree({ id: values.id }));

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
