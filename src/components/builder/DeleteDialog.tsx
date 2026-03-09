'use client';

import { useTransition } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

import Dialog from '#components/styled/Dialog.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import useLocalTrees from '#hooks/useLocalTrees.ts';
import { deleteTalentTree } from '#server/api/talentTree.actions.ts';
import { type TalentFormT } from '#server/schemas.ts';

const DeleteDialog = () => {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	const { deleteTree } = useLocalTrees();
	const { getValues } = useFormContext<TalentFormT>();
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
			<h3 className="haax-color">Delete &quot;{name}&quot;?</h3>
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
					onClick={() =>
						startTransition(async () => {
							const values = getValues();

							if (values.createdById === null) deleteTree(values.id);
							else await deleteTalentTree({ id: values.id });

							if (window.history.length > 1) router.back();
							else router.push('/');
						})
					}
					className="text-red"
				>
					Delete
				</TextButton>
			</div>
		</Dialog>
	);
};

export default DeleteDialog;
