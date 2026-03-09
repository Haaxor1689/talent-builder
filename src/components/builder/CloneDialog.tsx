'use client';

import { useState, useTransition } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Copy, X } from 'lucide-react';
import { nanoid } from 'nanoid';

import useLocalTrees from '#hooks/useLocalTrees.ts';
import { upsertTalentTree } from '#server/api/talentTree.actions.ts';
import { type TalentFormT } from '#server/schemas.ts';

import Input from '../form/Input';
import Dialog, { closeDialog } from '../styled/Dialog';
import TextButton from '../styled/TextButton';
import { toast } from '../ToastProvider';
import { VisibilityInput } from './VisibilityInput';

const SaveDialog = ({ disabled }: { disabled?: boolean }) => {
	const [isPending, startTransition] = useTransition();

	const router = useRouter();

	const { upsertTree } = useLocalTrees();

	const { getValues } = useFormContext<TalentFormT>();
	const name = useWatch({ name: 'name' });

	const [newName, setNewName] = useState('');
	const [visibility, setVisibility] = useState<TalentFormT['visibility']>(null);

	return (
		<Dialog
			trigger={open => (
				<TextButton
					icon={<Copy />}
					title="Clone"
					onClick={() => {
						open();
						setNewName(name);
						setVisibility(null);
					}}
					disabled={disabled}
				/>
			)}
			className="w-full"
		>
			<h3 className="haax-color">Clone &quot;{name}&quot;</h3>

			<hr />

			<Input
				label="New name"
				value={newName}
				onChange={e => setNewName(e.target.value)}
			/>
			<VisibilityInput visibility={visibility} setVisibility={setVisibility} />

			<hr />

			<div className="-m-2 flex justify-end gap-2">
				<TextButton icon={<X />} onClick={closeDialog}>
					Cancel
				</TextButton>
				<TextButton
					icon={<Copy />}
					onClick={() =>
						startTransition(async () => {
							const tree: TalentFormT = {
								...getValues(),
								id: nanoid(10),
								name: newName,
								visibility,
								collection: null,
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
								await upsertTalentTree(tree);
								toast({ message: 'Saved!', type: 'success' });
								router.push(`/tree/${tree.id}`);
							}
							toast({
								message: 'Cloned successfully!',
								type: 'success'
							});
						})
					}
					loading={isPending}
				>
					Clone
				</TextButton>
			</div>
		</Dialog>
	);
};

export default SaveDialog;
