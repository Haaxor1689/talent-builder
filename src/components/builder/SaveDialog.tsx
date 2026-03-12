'use client';

import { useState, useTransition } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';

import useLocalTrees from '#hooks/useLocalTrees.ts';
import {
	deleteTalentTree,
	upsertTalentTree
} from '#server/api/talentTree.actions.ts';
import { type TalentForm } from '#server/schemas.ts';

import Dialog, { closeDialog } from '../styled/Dialog';
import TextButton from '../styled/TextButton';
import { toast } from '../ToastProvider';
import { VisibilityInput } from './VisibilityInput';

const SaveDialog = ({ disabled }: { disabled?: boolean }) => {
	const [isPending, startTransition] = useTransition();

	const router = useRouter();

	const { upsertTree, deleteTree } = useLocalTrees();

	const { getValues, reset } = useFormContext<TalentForm>();

	const name = useWatch({ name: 'name' });
	const [visibility, setVisibility] = useState<TalentForm['visibility']>(
		useWatch({ name: 'visibility' })
	);

	return (
		<Dialog
			trigger={open => (
				<TextButton
					icon={<Save />}
					title="Save"
					onClick={open}
					disabled={disabled}
				/>
			)}
			className="w-full"
		>
			<h3 className="haax-color">Save changes to &quot;{name}&quot;</h3>

			<hr />

			<VisibilityInput visibility={visibility} setVisibility={setVisibility} />

			<hr />

			<div className="-m-2 flex justify-end gap-2">
				<TextButton icon={<X />} onClick={closeDialog}>
					Cancel
				</TextButton>
				<TextButton
					icon={<Save />}
					onClick={e => {
						const currentTarget = e.currentTarget;
						startTransition(async () => {
							const values = getValues();
							const tree = { ...values, visibility };
							const isNew = tree.createdBy === null;
							const shouldDelete = !isNew && values.visibility !== visibility;
							if (!tree.visibility) {
								upsertTree(tree);
								if (shouldDelete) await deleteTalentTree({ id: tree.id });
								if (isNew) router.push(`/local?tree=${tree.id}`);
							} else {
								await upsertTalentTree(tree);
								if (shouldDelete) deleteTree(tree.id);
								if (isNew) router.push(`/tree/${tree.id}`);
							}
							toast({
								message: 'Changes saved successfully!',
								type: 'success'
							});
							if (!isNew) reset(tree);
							closeDialog({ currentTarget });
						});
					}}
					loading={isPending}
				>
					Save
				</TextButton>
			</div>
		</Dialog>
	);
};

export default SaveDialog;
