'use client';

import { CirclePlus, LockKeyhole, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
	Controller,
	useController,
	useFormContext,
	useWatch
} from 'react-hook-form';

import IconPicker from '#components/form/IconPicker.tsx';
import Input from '#components/form/Input.tsx';
import SlugInput from '#components/form/SlugInput.tsx';
import VisibilityInput from '#components/form/VisibilityInput.tsx';
import Dialog, { closeDialog } from '#components/styled/Dialog.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import { toast } from '#components/ToastProvider.tsx';
import useAsyncAction from '#hooks/useAsyncAction.tsx';
import useIsSupporter from '#hooks/useIsSupporter.tsx';
import { upsertCollection } from '#server/api/collection.actions.ts';
import { type CollectionForm } from '#server/schemas.ts';
import { invoke } from '#utils/index.ts';

const SaveDialog = () => {
	const { isSupporter, supportCta } = useIsSupporter('Creating collections');
	const router = useRouter();

	const [isPending, startTransition] = useAsyncAction();

	const form = useFormContext<CollectionForm>();
	const id = useWatch<CollectionForm, 'id'>({ name: 'id' });
	const slug = useController<CollectionForm, 'slug'>({ name: 'slug' });

	return (
		<Dialog
			trigger={open => (
				<TextButton icon={<Save />} onClick={open}>
					Save collection
				</TextButton>
			)}
			className="max-w-[min(calc(100%-1rem),var(--container-xl))]"
		>
			<h3 className="haax-color">Save collection</h3>
			<hr />
			{supportCta}

			<div className="flex items-center gap-2">
				<IconPicker name="icon" disabled={!isSupporter} />
				<Input
					placeholder="Collection name"
					{...form.register('name')}
					disabled={!isSupporter}
					className="grow"
				/>
			</div>

			<SlugInput
				placeholder={id}
				slug={slug.field.value}
				setSlug={value => slug.field.onChange(value)}
				url="/collections/"
			/>

			<Controller
				name="visibility"
				render={({ field }) => (
					<VisibilityInput
						visibility={field.value}
						setVisibility={value => field.onChange(value)}
						noLocal
						disabled={!isSupporter}
					/>
				)}
			/>

			<hr />
			<div className="-m-2 flex justify-end gap-2">
				<TextButton icon={<X />} onClick={closeDialog}>
					Cancel
				</TextButton>
				<TextButton
					icon={isSupporter ? <CirclePlus /> : <LockKeyhole />}
					loading={isPending}
					onClick={startTransition(async currentTarget => {
						const values = form.getValues();
						await invoke(upsertCollection(values));
						toast({ message: 'Collection created', type: 'success' });
						closeDialog({ currentTarget });
						router.push(`/collections/${values.slug ?? values.id}`);
					})}
					disabled={!isSupporter}
				>
					Create
				</TextButton>
			</div>
		</Dialog>
	);
};

export default SaveDialog;
