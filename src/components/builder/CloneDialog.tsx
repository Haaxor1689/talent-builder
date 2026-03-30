'use client';

import { Copy, X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import SlugInput from '#components/form/SlugInput.tsx';
import useAsyncAction from '#hooks/useAsyncAction.tsx';
import useLocalTrees from '#hooks/useLocalTrees.ts';
import { upsertTalentTree } from '#server/api/talentTree.actions.ts';
import { type TalentForm } from '#server/schemas.ts';
import { invoke } from '#utils/index.ts';

import Input from '../form/Input';
import VisibilityInput from '../form/VisibilityInput';
import Dialog, { closeDialog } from '../styled/Dialog';
import TextButton from '../styled/TextButton';
import { toast } from '../ToastProvider';

const CloneDialog = ({ disabled }: { disabled?: boolean }) => {
	const [isPending, startTransition] = useAsyncAction();

	const router = useRouter();

	const { upsertTree } = useLocalTrees();

	const { getValues } = useFormContext<TalentForm>();
	const name = useWatch({ name: 'name' });

	const newId = nanoid(10);
	const [newName, setNewName] = useState('');
	const [newSlug, setNewSlug] = useState<string | null>(null);
	const [visibility, setVisibility] = useState<TalentForm['visibility']>(null);

	return (
		<Dialog
			trigger={open => (
				<TextButton
					icon={<Copy />}
					title="Clone"
					onClick={() => {
						open();
						setNewName(name);
						setNewSlug(null);
						setVisibility(null);
					}}
					disabled={disabled}
				/>
			)}
		>
			<h3 className="haax-color">Clone &quot;{name}&quot;</h3>

			<hr />

			<Input
				label="New name"
				value={newName}
				onChange={e => setNewName(e.target.value)}
			/>
			{!!visibility && (
				<SlugInput
					placeholder={newId}
					slug={newSlug}
					setSlug={setNewSlug}
					url="/tree/"
				/>
			)}
			<VisibilityInput visibility={visibility} setVisibility={setVisibility} />

			<hr />

			<div className="-m-2 flex justify-end gap-2">
				<TextButton icon={<X />} onClick={closeDialog}>
					Cancel
				</TextButton>
				<TextButton
					icon={<Copy />}
					onClick={startTransition(async () => {
						const tree: TalentForm = {
							...getValues(),
							id: newId,
							name: newName,
							slug: visibility ? newSlug : null,
							visibility,
							createdById: null,
							createdBy: null,
							createdAt: null,
							updatedAt: null
						};

						if (!tree.visibility) {
							upsertTree(tree);
							toast({ message: 'Saved locally!', type: 'success' });
							router.push(`/local?tree=${tree.id}`);
						} else {
							await invoke(upsertTalentTree(tree));
							toast({ message: 'Saved!', type: 'success' });
							router.push(`/tree/${tree.slug ?? tree.id}`);
						}
						toast({
							message: 'Cloned successfully!',
							type: 'success'
						});
					})}
					loading={isPending}
				>
					Clone
				</TextButton>
			</div>
		</Dialog>
	);
};

export default CloneDialog;
