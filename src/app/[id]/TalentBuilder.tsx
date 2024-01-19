'use client';

import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { v4 } from 'uuid';
import { Copy, Save, Trash2, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { api } from '~/trpc/react';
import { type TalentTreeTable } from '~/server/db/schema';

import ConfirmDialog from '../_components/ConfirmDialog';
import IconPicker from '../_components/form/IconPicker';
import Input from '../_components/form/Input';
import ImportDialog from '../_components/ImportDialog';
import TalentEdit from '../_components/TalentEdit';
import {
	type TalentFormT,
	type TalentT,
	TalentForm
} from '../../server/api/types';
import { zodResolver } from '../_components/utils';
import TextButton from '../_components/styled/TextButton';
import CheckboxInput from '../_components/form/CheckboxInput';
import useLocalStorage from '../_components/hooks/useLocalStorage';

import TalentPreview from './TalentPreview';
import PointsSummary from './PointsSummary';

const emptyTalentTree = {
	id: v4(),
	public: false,
	class: null,
	icon: 'inv_misc_questionmark',
	name: 'Unnamed',
	selected: undefined,
	tree: [...Array(4 * 7).keys()].map(() => ({} as TalentT))
} as TalentFormT;

type Props =
	| {
			isLocal?: false;
			isNew?: false;
			defaultValues?: TalentTreeTable;
	  }
	| {
			isLocal: true;
			isNew?: boolean;
			defaultValues?: TalentFormT;
	  };

const TalentBuilder = (props: Props) => {
	const session = useSession();
	const router = useRouter();

	const setSavedState = useLocalStorage<TalentFormT>('saved-form-state')[1];

	const setSavedSpecs =
		useLocalStorage<Record<string, TalentFormT>>('saved-specs')[1];

	const editable =
		props.isLocal ||
		(session.status === 'authenticated' &&
			session.data.user.id === props.defaultValues?.createdById);

	const deleteTree = api.talentTree.delete.useMutation();
	const updateTree = api.talentTree.upsert.useMutation();

	const formProps = useForm({
		defaultValues: props.defaultValues ?? emptyTalentTree,
		resolver: zodResolver(TalentForm)
	});
	const { handleSubmit, register, setValue, getValues, reset, control } =
		formProps;

	const [selected, setSelected] = useState(0);
	const { fields } = useFieldArray({ control, name: 'tree' });

	return (
		<FormProvider {...formProps}>
			<form
				// TODO: Implement submit
				onSubmit={handleSubmit(v => console.log(v))}
				className="tw-surface flex flex-col gap-3"
			>
				<div className="flex flex-col items-center gap-3 md:flex-row">
					<div className="flex flex-grow items-center gap-4">
						<IconPicker required name="icon" disabled={!editable} />
						<Input
							{...register('name')}
							disabled={!editable}
							className="text-3xl"
						/>
						<PointsSummary />
						{!editable && <p className="text-pink">Read only</p>}
					</div>
					<div className="flex items-center">
						{props.isLocal ? (
							<p className="pr-2 text-blueGray">Local</p>
						) : (
							<CheckboxInput
								name="public"
								label="Public"
								disabled={!editable}
							/>
						)}

						<TextButton
							onClick={async () => {
								const values = getValues();
								setSavedSpecs(p => ({ ...p, [values.id]: values }));
								if (props.isNew) router.push(`/${values.id}?local`);
							}}
							icon={Save}
							title="Save"
							disabled={!editable}
						/>

						<TextButton
							onClick={async () => {
								const values = getValues();
								await updateTree.mutateAsync(values);
								if (props.isNew) router.push(`/${values.id}`);
							}}
							icon={UploadCloud}
							title="Publish"
							disabled={!editable || session.status !== 'authenticated'}
						/>

						<TextButton
							onClick={() => {
								const values = getValues();
								const newId = v4();
								setSavedState({ ...values, id: newId });
								router.push('/new');
							}}
							icon={Copy}
							title="Duplicate"
							disabled={props.isNew}
						/>

						<ImportDialog onSubmit={reset} disabled={!editable} />

						<ConfirmDialog
							title={`Are you sure you want to delete "${
								getValues().name
							}" tree?`}
							confirm={() => {
								if (props.isNew) {
									reset(emptyTalentTree);
									return;
								}
								const values = getValues();
								if (props.isLocal) {
									setSavedSpecs(savedSpecs => {
										const { [values.id]: _, ...newSpecs } = savedSpecs ?? {};
										return newSpecs;
									});
								} else {
									deleteTree.mutateAsync(values.id);
								}
								router.push('/');
							}}
						>
							{open => (
								<TextButton
									onClick={open}
									icon={Trash2}
									title="Delete"
									disabled={!editable}
									className={editable ? 'text-red' : undefined}
								/>
							)}
						</ConfirmDialog>
					</div>
				</div>

				<hr />

				<div className="flex flex-col gap-3 md:flex-row md:justify-center">
					<div className="grid flex-shrink-0 flex-grow grid-cols-[auto_auto_auto_auto] content-start justify-center gap-6 self-center p-6">
						{fields.map((field, i) => (
							<TalentPreview
								key={field.id}
								i={i}
								selected={selected}
								setSelected={setSelected}
							/>
						))}
					</div>

					<hr className="md:hidden" />

					<div className="flex flex-col gap-3 border-0 border-gray/40 md:-my-3 md:max-w-md md:border-l md:py-3 md:pl-3">
						<TalentEdit
							key={selected}
							selected={selected}
							editable={editable}
							onDelete={() => {
								setValue(`tree.${selected}`, {
									icon: '',
									name: '',
									ranks: null,
									description: '',
									requires: null
								});
								setSelected(selected);
							}}
						/>
					</div>
				</div>
			</form>
		</FormProvider>
	);
};

export default TalentBuilder;
