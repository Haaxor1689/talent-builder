'use client';

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';
import { nanoid } from 'nanoid';

import Input from '#components/form/Input.tsx';
import SlugInput from '#components/form/SlugInput.tsx';
import useAsyncAction from '#hooks/useAsyncAction.tsx';
import useLocalTrees from '#hooks/useLocalTrees.ts';
import {
	deleteTalentTree,
	upsertTalentTree
} from '#server/api/talentTree.actions.ts';
import { type TalentForm } from '#server/schemas.ts';
import { invoke } from '#utils/index.ts';

import { VisibilityInput } from '../form/VisibilityInput';
import Dialog, { closeDialog } from '../styled/Dialog';
import TextButton from '../styled/TextButton';
import { toast } from '../ToastProvider';

const SaveDialog = ({ disabled }: { disabled?: boolean }) => {
	const [isPending, startTransition] = useAsyncAction();

	const router = useRouter();

	const { upsertTree, deleteTree } = useLocalTrees();

	const { getValues, reset } = useFormContext<TalentForm>();

	const id = useWatch<TalentForm, 'id'>({ name: 'id' });
	const name = useWatch<TalentForm, 'name'>({ name: 'name' });
	const slug = useWatch<TalentForm, 'slug'>({ name: 'slug' });
	const visibility = useWatch<TalentForm, 'visibility'>({ name: 'visibility' });

	const [newSlug, setNewSlug] = useState(slug);
	const [newVisibility, setNewVisibility] = useState(visibility);

	const changingStorage =
		visibility !== newVisibility && (!visibility || !newVisibility);
	const newId = changingStorage ? nanoid(10) : id;

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
		>
			<h3 className="haax-color">Save changes</h3>

			<hr />

			<Input label="Name:" value={name} disabled />
			{!!newVisibility && (
				<SlugInput
					placeholder={newId}
					slug={newSlug}
					setSlug={setNewSlug}
					url="/tree/"
				/>
			)}
			<VisibilityInput
				visibility={newVisibility}
				setVisibility={setNewVisibility}
			/>

			<hr />

			<div className="-m-2 flex justify-end gap-2">
				<TextButton icon={<X />} onClick={closeDialog}>
					Cancel
				</TextButton>
				<TextButton
					icon={<Save />}
					onClick={startTransition(async currentTarget => {
						const tree = {
							...getValues(),
							id: newId,
							slug: newVisibility ? newSlug : null,
							visibility: newVisibility
						};
						const isNew = tree.createdBy === null;
						const shouldDelete = !isNew && changingStorage;

						if (!tree.visibility) {
							upsertTree(tree);
							if (shouldDelete) await invoke(deleteTalentTree({ id: tree.id }));
						} else {
							await invoke(upsertTalentTree(tree));
							if (shouldDelete) deleteTree(tree.id);
						}
						toast({
							message: 'Changes saved successfully!',
							type: 'success'
						});
						router.push(
							newVisibility
								? `/tree/${newSlug ?? newId}`
								: `/local?tree=${newId}`
						);
						reset(tree, { keepDefaultValues: false });
						closeDialog({ currentTarget });
					})}
					loading={isPending}
				>
					Save
				</TextButton>
			</div>
		</Dialog>
	);
};

export default SaveDialog;
