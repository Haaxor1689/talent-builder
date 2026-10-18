'use client';

import { Save, Trash2 } from 'lucide-react';
import { FormProvider, useController, useForm } from 'react-hook-form';

import { useSession } from '#auth/client.ts';
import NotesEditor from '#components/styled/NotesEditor.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import { toast } from '#components/ToastProvider.tsx';
import useAsyncAction from '#hooks/useAsyncAction.tsx';
import { upsertCollection } from '#server/api/collection.actions.ts';
import { CollectionForm } from '#server/schemas.ts';
import { canEdit } from '#utils/auth.ts';
import { invoke, zodResolver } from '#utils/index.ts';

type Props = {
	collection: CollectionForm;
	classId: number;
};

const ClassNotes = ({ collection, classId }: Props) => {
	const session = useSession().data;
	const editable = session ? canEdit(session.user, collection) : false;
	const [isPending, startTransition] = useAsyncAction();

	const form = useForm({
		defaultValues: collection,
		resolver: zodResolver(CollectionForm)
	});

	const { field } = useController<CollectionForm, 'classNotes.0'>({
		name: `classNotes.${classId}` as 'classNotes.0',
		control: form.control
	});

	return (
		<FormProvider {...form}>
			<NotesEditor
				value={field.value}
				onChange={field.onChange}
				editable={editable}
				editAction={stopEditing => (
					<div className="flex gap-1">
						<TextButton
							icon={<Trash2 />}
							onClick={() => {
								stopEditing();
								form.reset();
							}}
							className="text-red"
						>
							Discard changes
						</TextButton>
						<TextButton
							icon={<Save />}
							loading={isPending}
							onClick={startTransition(async () => {
								stopEditing();
								await invoke(upsertCollection(form.getValues()));
								toast({ message: 'Class notes saved', type: 'success' });
							})}
							className="self-start"
						>
							Save changes
						</TextButton>
					</div>
				)}
				emptyText="*This collection contains no general notes.*"
			/>
		</FormProvider>
	);
};

export default ClassNotes;
