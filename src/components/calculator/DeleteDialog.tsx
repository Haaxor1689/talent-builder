'use client';

import { useFormContext } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

import Dialog from '#components/styled/Dialog.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import useAsyncAction from '#hooks/useAsyncAction.tsx';
import { deleteSavedBuild } from '#server/api/savedBuilds.actions.ts';
import { type BuildForm } from '#server/schemas.ts';
import { invoke } from '#utils/index.ts';

const DeleteDialog = ({ name }: { name: string }) => {
	const [isPending, startTransition] = useAsyncAction();
	const router = useRouter();
	const { getValues } = useFormContext<BuildForm>();

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
			<h3 className="haax-color">Delete saved calculator?</h3>
			<hr />
			<p className="text-blue-gray">
				Are you sure you want to delete <span>&quot;{name}&quot;</span> build?
			</p>
			<p className="text-blue-gray">This action cannot be undone!</p>
			<hr />
			<div className="-m-2 flex justify-end gap-2">
				<TextButton
					icon={<Trash2 />}
					loading={isPending}
					onClick={startTransition(async () => {
						const { id } = getValues();
						await invoke(deleteSavedBuild({ id }));
						router.push('/calculator');
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
