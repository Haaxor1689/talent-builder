'use client';

import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { v4 } from 'uuid';
import {
	CloudOff,
	Copy,
	FileLock2,
	NotebookPen,
	Save,
	Trash2,
	UploadCloud
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

import {
	deleteTalentTree,
	upsertTalentTree
} from '~/server/api/routers/talentTree';

import ConfirmDialog from '../ConfirmDialog';
import IconPicker from '../form/IconPicker';
import Input from '../form/Input';
import ImportDialog from '../ImportDialog';
import {
	type TalentFormT,
	TalentForm,
	EmptyTalentTree
} from '../../../server/api/types';
import { zodResolver } from '../../../utils';
import TextButton from '../styled/TextButton';
import CheckboxInput from '../form/CheckboxInput';
import useLocalStorage from '../hooks/useLocalStorage';
import ClassPicker from '../form/ClassPicker';
import UndoRedo from '../form/UndoRedo';
import AuthorTag from '../styled/AuthorTag';
import Textarea from '../form/Textarea';

import TalentPreview from './TalentPreview';
import PointsSummary from './PointsSummary';
import TalentEdit from './TalentEdit';

type Props = {
	defaultValues?: TalentFormT;
} & ({ isLocal?: false; isNew?: false } | { isLocal: true; isNew?: boolean });

const TalentBuilder = (props: Props) => {
	const [disableInteractions, setDisableInteractions] = useState(false);
	const asyncTask =
		<T extends unknown[]>(fn: (...args: T) => Promise<unknown>) =>
		(...args: T) => {
			setDisableInteractions(true);
			return fn(...args)
				.catch(e => toast.error(e?.message ?? JSON.stringify(e)))
				.finally(() => setDisableInteractions(false));
		};

	const session = useSession();
	const router = useRouter();

	const setSavedSpecs =
		useLocalStorage<Record<string, TalentFormT>>('saved-specs')[1];

	const editable =
		props.isLocal ||
		(session.status === 'authenticated' &&
			(session.data.user.isAdmin ||
				session.data.user.id === props.defaultValues?.createdById));

	const defaultValues = useMemo(
		() => TalentForm.parse(props.defaultValues ?? EmptyTalentTree()),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	const formProps = useForm({
		defaultValues,
		resolver: zodResolver(TalentForm)
	});
	const { register, getValues, reset, control, formState } = formProps;

	const [selected, setSelected] = useState(-1);
	const { fields } = useFieldArray({ control, name: 'tree' });

	return (
		<FormProvider {...formProps}>
			<form className="tw-surface flex flex-col gap-3">
				<div className="flex flex-col gap-3 md:flex-row md:items-center">
					<div className="flex grow items-center gap-4 overflow-hidden">
						<IconPicker required name="icon" disabled={!editable} />
						<Input
							{...register('name')}
							disabled={!editable}
							className="grow"
							inputClassName="text-3xl"
						/>
					</div>

					<div className="flex items-center">
						<ClassPicker name="class" disabled={!editable} />
						{editable && (
							<TextButton
								onClick={asyncTask(async () => {
									const values = getValues();
									if (!props.isLocal) {
										const newTree = await upsertTalentTree(values);
										toast.success('Saved!');
										newTree && reset(newTree);
										return;
									}
									setSavedSpecs(p => ({ ...p, [values.id]: values }));
									toast.success('Saved!');
									reset(values);
									if (props.isNew) router.push(`/local/${values.id}`);
								})}
								icon={Save}
								title={props.isLocal ? 'Save locally' : 'Save changes'}
								disabled={!formState.isDirty || disableInteractions}
							/>
						)}

						{props.isLocal && session.status === 'authenticated' && (
							<TextButton
								onClick={asyncTask(async () => {
									const values = getValues();
									const newId = v4();
									await upsertTalentTree({ ...values, id: newId });
									setSavedSpecs(savedSpecs => {
										const { [values.id]: _, ...newSpecs } = savedSpecs ?? {};
										return newSpecs;
									});
									toast.success('Talent tree saved online!');
									router.push(`/tree/${newId}`);
								})}
								icon={UploadCloud}
								title="Save online"
								disabled={
									(props.isNew && !formState.isDirty) || disableInteractions
								}
							/>
						)}

						{!props.isNew && (
							<TextButton
								onClick={asyncTask(async () => {
									const values = getValues();
									const newId = v4();
									setSavedSpecs(savedSpecs => ({
										...savedSpecs,
										[newId]: {
											...values,
											id: newId,
											name: `${values.name} (copy)`,
											createdById: null,
											public: false
										}
									}));
									toast.success('New copy saved locally!');
									router.push(`/local/${newId}`);
								})}
								icon={Copy}
								title="Clone locally"
								disabled={disableInteractions}
							/>
						)}

						{editable && <ImportDialog disabled={disableInteractions} />}

						{editable && (
							<ConfirmDialog
								title={`Are you sure you want to delete "${
									getValues().name
								}" tree?`}
								confirm={asyncTask(async () => {
									if (props.isNew) {
										reset(EmptyTalentTree());
										return;
									}
									const values = getValues();
									if (props.isLocal) {
										setSavedSpecs(savedSpecs => {
											const { [values.id]: _, ...newSpecs } = savedSpecs ?? {};
											return newSpecs;
										});
									} else {
										await deleteTalentTree(values.id);
									}
									router.push('/');
								})}
							>
								{open => (
									<TextButton
										onClick={open}
										icon={Trash2}
										title="Delete"
										className={editable ? 'text-red' : undefined}
										disabled={disableInteractions}
									/>
								)}
							</ConfirmDialog>
						)}
					</div>
				</div>

				<hr />

				<div className="flex flex-col gap-3 md:flex-row md:justify-center">
					<div className="relative grid grow select-none grid-cols-[repeat(4,_max-content)] content-center justify-center gap-6 overflow-x-auto py-9 md:py-[72px]">
						{fields.map((field, i) => (
							<TalentPreview
								key={field.id ?? i}
								i={i}
								selected={selected}
								setSelected={setSelected}
								editable={editable}
							/>
						))}

						{editable && <UndoRedo defaultValues={defaultValues} />}

						<div className="absolute right-0 top-0 overflow-hidden">
							<TextButton
								icon={NotebookPen}
								title="Notes"
								onClick={() => setSelected(-1)}
								className="-m-2"
							/>
						</div>

						<div className="absolute bottom-0 left-0 flex flex-col gap-2">
							{!editable ? (
								<p className="flex gap-1 text-pink">
									<FileLock2 /> Read only
								</p>
							) : props.isLocal ? (
								<p className="flex gap-1 text-blueGray">
									<CloudOff size={24} />
									Local only
								</p>
							) : (
								<div className="overflow-hidden">
									<CheckboxInput
										name="public"
										label="Publicly visible"
										disabled={!editable}
										className="!p-0"
									/>
								</div>
							)}
							{defaultValues.createdBy && (
								<div className="flex items-center gap-1.5 text-blueGray">
									Author: <AuthorTag {...defaultValues.createdBy} />
								</div>
							)}
						</div>

						<PointsSummary />
					</div>

					<hr className="md:hidden" />

					<div className="flex grow flex-col gap-3 border-0 border-gray/40 md:-my-3 md:max-w-sm md:border-l md:py-3 md:pl-3">
						{selected === -1 ? (
							<div className="flex w-full grow flex-col gap-4 md:max-w-md">
								<Textarea
									{...register('notes')}
									label="Notes"
									disabled={!editable}
									className="grow"
									maxRows={22}
								/>
							</div>
						) : (
							<TalentEdit
								key={selected}
								selected={selected}
								editable={editable}
							/>
						)}
					</div>
				</div>
			</form>
		</FormProvider>
	);
};

export default TalentBuilder;
