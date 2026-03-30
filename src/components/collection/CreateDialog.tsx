'use client';

import { LockKeyhole, PlusCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
	Controller,
	FormProvider,
	useController,
	useForm,
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
import { CollectionForm } from '#server/schemas.ts';
import { invoke, zodResolver } from '#utils/index.ts';

const CreateDialog = () => {
	const { isSupporter, supportCta } = useIsSupporter('Creating collections');
	const router = useRouter();

	const [isPending, startTransition] = useAsyncAction();

	const formProps = useForm({
		defaultValues: CollectionForm.parse({}),
		resolver: zodResolver(CollectionForm)
	});

	const id = useWatch({ name: 'id', control: formProps.control });
	const slug = useController({ name: 'slug', control: formProps.control });

	return (
		<Dialog
			trigger={open => (
				<TextButton icon={<PlusCircle />} onClick={open}>
					Create new
				</TextButton>
			)}
			className="max-w-[min(calc(100%-1rem),var(--container-xl))]"
		>
			<FormProvider {...formProps}>
				<h3 className="haax-color">Create collection</h3>
				<hr />
				{supportCta}

				<div className="flex items-center gap-2">
					<IconPicker name="icon" disabled={!isSupporter} />
					<Input
						placeholder="Collection name"
						{...formProps.register('name')}
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

				<Controller<CollectionForm, 'visibility'>
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

				<p className="text-blue-gray">
					Collections are a way to group talents together into{' '}
					<span>class calculators</span> and <span>export</span> them. You can
					create a collection for a specific project, theme, or any other reason
					you can think of.
				</p>
				<hr />
				<div className="-m-2 flex justify-end gap-2">
					<TextButton icon={<X />} onClick={closeDialog}>
						Cancel
					</TextButton>
					<TextButton
						icon={isSupporter ? <PlusCircle /> : <LockKeyhole />}
						loading={isPending}
						onClick={startTransition(async currentTarget => {
							const values = formProps.getValues();
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
			</FormProvider>
		</Dialog>
	);
};

export default CreateDialog;
