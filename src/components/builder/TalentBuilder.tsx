'use client';

import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import {
	CloudOff,
	Copy,
	FileLock2,
	NotebookPen,
	Pin,
	Save,
	Trash2,
	UploadCloud
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { nanoid } from 'nanoid';

import {
	deleteTalentTree,
	promoteTalentTree,
	upsertTalentTree
} from '~/server/api/routers/talentTree';
import { type TalentFormT, TalentForm } from '~/server/api/types';
import { zodResolver } from '~/utils';
import useAsyncAction from '~/hooks/useAsyncAction';
import useLocalTrees from '~/hooks/useLocalTrees';

import ConfirmDialog from '../ConfirmDialog';
import IconPicker from '../form/IconPicker';
import Input from '../form/Input';
import TextButton from '../styled/TextButton';
import CheckboxInput from '../form/CheckboxInput';
import ClassPicker from '../form/ClassPicker';
import UndoRedo from '../form/UndoRedo';
import AuthorTag from '../styled/AuthorTag';
import Textarea from '../form/Textarea';

import TalentPreview from './TalentPreview';
import PointsSummary from './PointsSummary';
import TalentEdit from './TalentEdit';
import IdxInput from './IdxInput';

type Props = {
	defaultValues?: TalentFormT;
} & ({ isLocal?: false; isNew?: false } | { isLocal: true; isNew?: boolean });

const TalentBuilder = (props: Props) => {
	const { disableInteractions, asyncAction } = useAsyncAction();

	const session = useSession();
	const router = useRouter();

	const setSavedSpecs = useLocalTrees()[1];

	const editable =
		props.isLocal ||
		(session.status === 'authenticated' &&
			(session.data.user.isAdmin ||
				session.data.user.id === props.defaultValues?.createdById));

	const defaultValues = useMemo(
		() => TalentForm.parse(props.defaultValues ?? {}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	const formProps = useForm({
		defaultValues,
		resolver: zodResolver(TalentForm)
	});
	const { register, getValues, reset, control, formState } = formProps;

	const [selected, setSelected] = useState(-1);
	const { fields } = useFieldArray({ control, name: 'talents' });

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
						<IdxInput control={control} />
						{!props.isLocal && session.data?.user.isAdmin && (
							<TextButton
								icon={Pin}
								title="Promote to proposal"
								onClick={asyncAction(async () => {
									const values = getValues();
									await promoteTalentTree(values.id);
									toast.success('Success');
								})}
							/>
						)}
						{editable && (
							<TextButton
								onClick={asyncAction(async () => {
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
								onClick={asyncAction(async () => {
									const values = getValues();
									const newId = nanoid(10);
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
								onClick={asyncAction(async () => {
									const values = getValues();
									const newId = nanoid(10);
									setSavedSpecs(savedSpecs => ({
										...savedSpecs,
										[newId]: {
											...values,
											id: newId,
											name: `${values.name} (copy)`,
											public: false,
											createdBy: null,
											createdById: null,
											createdAt: null,
											updatedAt: null
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

						{editable && (
							<ConfirmDialog
								title={`Are you sure you want to delete "${
									getValues().name
								}" tree?`}
								confirm={asyncAction(async () => {
									if (props.isNew) {
										reset(TalentForm.parse({}));
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
					<div className="relative grow">
						<div className="grid grow select-none grid-cols-[repeat(4,_max-content)] content-center justify-center gap-6 overflow-x-auto py-9 md:py-[72px]">
							{fields.map((field, i) => (
								<TalentPreview
									key={field.id ?? i}
									i={i}
									selected={selected}
									setSelected={setSelected}
									editable={editable}
								/>
							))}
						</div>

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
								<CheckboxInput
									name="public"
									label="Publicly visible"
									disabled={!editable}
									className="!p-0"
								/>
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
