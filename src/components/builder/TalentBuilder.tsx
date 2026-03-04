'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
	Camera,
	CloudOff,
	Copy,
	FileLock2,
	NotebookPen,
	Save,
	Trash2,
	UploadCloud
} from 'lucide-react';
import { nanoid } from 'nanoid';

import { useSession } from '#auth/client.ts';
import useLocalTrees from '#hooks/useLocalTrees.ts';
import {
	deleteTalentTree,
	upsertTalentTree
} from '#server/api/routers/talentTree.ts';
import { TalentForm, type TalentFormT } from '#server/schemas.ts';
import { elementToPng, zodResolver } from '#utils.ts';

import ConfirmDialog from '../ConfirmDialog';
import CheckboxInput from '../form/CheckboxInput';
import ClassPicker from '../form/ClassPicker';
import IconPicker from '../form/IconPicker';
import Input from '../form/Input';
import UndoRedo from '../form/UndoRedo';
import AuthorTag from '../styled/AuthorTag';
import TextButton from '../styled/TextButton';
import { toast } from '../ToastProvider';
import IdxInput from './IdxInput';
import Notes from './Notes';
import PointsSummary from './PointsSummary';
import TalentEdit from './TalentEdit';
import TalentPreview from './TalentPreview';

type Props = {
	defaultValues?: TalentFormT;
} & ({ isLocal?: false; isNew?: false } | { isLocal: true; isNew?: boolean });

const TalentBuilder = (props: Props) => {
	const treeElemRef = useRef<HTMLDivElement>(null);
	const [isPending, startTransition] = useTransition();

	const session = useSession();
	const router = useRouter();

	const setSavedSpecs = useLocalTrees()[1];

	const editable =
		!!props.isLocal ||
		session.data?.user.role === 'admin' ||
		session.data?.user.id === props.defaultValues?.createdById;

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
			<form className="haax-surface-3 flex flex-col gap-3">
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

					<div className="flex shrink items-center">
						<ClassPicker name="class" disabled={!editable} />
						<IdxInput control={control} disabled={!editable} />
						{session.data?.user.role === 'admin' && (
							<Input
								placeholder="Collection"
								{...register('collection')}
								className="shrink grow"
							/>
						)}
						{editable && (
							<TextButton
								onClick={() =>
									startTransition(async () => {
										const values = getValues();
										if (!props.isLocal) {
											const newTree = await upsertTalentTree(values);
											toast({ message: 'Saved!', type: 'success' });
											newTree && reset(newTree);
											return;
										}
										setSavedSpecs(p => ({ ...p, [values.id]: values }));
										toast({ message: 'Saved!', type: 'success' });
										reset(values);
										if (props.isNew) router.push(`/local/${values.id}`);
									})
								}
								icon={Save}
								title={props.isLocal ? 'Save locally' : 'Save changes'}
								disabled={!formState.isDirty || isPending}
							/>
						)}

						{props.isLocal && session.data && (
							<TextButton
								onClick={() =>
									startTransition(async () => {
										const values = getValues();
										const newId = nanoid(10);
										await upsertTalentTree({ ...values, id: newId });
										setSavedSpecs(savedSpecs => {
											const { [values.id]: _, ...newSpecs } = savedSpecs ?? {};
											return newSpecs;
										});
										toast({
											message: 'Talent tree saved online!',
											type: 'success'
										});
										router.push(`/tree/${newId}`);
									})
								}
								icon={UploadCloud}
								title="Save online"
								disabled={(!!props.isNew && !formState.isDirty) || isPending}
							/>
						)}

						{!props.isNew && (
							<TextButton
								onClick={() =>
									startTransition(async () => {
										const values = getValues();
										const newId = nanoid(10);
										setSavedSpecs(savedSpecs => ({
											...savedSpecs,
											[newId]: {
												...values,
												id: newId,
												name: `${values.name} (copy)`,
												collection: null,
												public: false,
												createdBy: null,
												createdById: null,
												createdAt: null,
												updatedAt: null
											}
										}));
										toast({
											message: 'New copy saved locally!',
											type: 'success'
										});
										router.push(`/local/${newId}`);
									})
								}
								icon={Copy}
								title="Clone locally"
								disabled={isPending}
							/>
						)}

						{editable && (
							<ConfirmDialog
								title={`Are you sure you want to delete "${
									getValues().name
								}" tree?`}
								confirm={() =>
									startTransition(async () => {
										if (props.isNew) {
											reset(TalentForm.parse({}));
											return;
										}
										const values = getValues();
										if (props.isLocal) {
											setSavedSpecs(savedSpecs => {
												const { [values.id]: _, ...newSpecs } =
													savedSpecs ?? {};
												return newSpecs;
											});
										} else {
											await deleteTalentTree(values.id);
										}
										router.push('/');
									})
								}
							>
								{open => (
									<TextButton
										onClick={open}
										icon={Trash2}
										title="Delete"
										className={editable ? 'text-red' : undefined}
										disabled={isPending}
									/>
								)}
							</ConfirmDialog>
						)}
					</div>
				</div>

				<hr />

				<div className="-m-3 flex flex-col md:flex-row md:justify-center">
					<div className="relative flex grow">
						<div
							ref={treeElemRef}
							className="grid grow grid-cols-[repeat(4,max-content)] content-center justify-center gap-6 overflow-x-auto p-10 select-none md:py-18"
						>
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
						<div className="absolute top-3 right-3 flex gap-2 overflow-hidden">
							<TextButton
								icon={Camera}
								title="Screenshot"
								onClick={() => {
									if (!treeElemRef.current) return;
									elementToPng(treeElemRef.current, getValues().name);
								}}
								className="-m-2"
							/>
							<TextButton
								icon={NotebookPen}
								title="Notes"
								onClick={() => setSelected(-1)}
								className="-m-2"
							/>
						</div>
						<div className="absolute bottom-3 left-3 flex flex-col gap-2">
							{!editable ? (
								<p className="text-pink flex gap-1">
									<FileLock2 /> Read only
								</p>
							) : props.isLocal ? (
								<p className="text-blue-gray flex gap-1">
									<CloudOff size={24} />
									Local only
								</p>
							) : (
								<CheckboxInput
									name="public"
									label="Publicly visible"
									disabled={!editable}
									className="p-0!"
								/>
							)}
							{defaultValues.createdBy && (
								<div className="text-blue-gray flex items-center gap-1.5">
									Author: <AuthorTag {...defaultValues.createdBy} />
								</div>
							)}
						</div>
						<PointsSummary />
					</div>

					<div className="border-gray/40 shrink grow border-t md:ml-0 md:max-h-184 md:w-lg md:border-t-0 md:border-l">
						{selected === -1 ? (
							<Notes editable={editable} />
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
