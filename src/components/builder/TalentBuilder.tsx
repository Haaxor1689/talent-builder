'use client';

import { useRef, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { Camera, CloudOff, Eye, EyeOff, NotebookPen } from 'lucide-react';

import { useSession } from '#auth/client.ts';
import { UserAvatar, UserRoleText } from '#components/styled/User.tsx';
import { TalentForm, type TalentFormT } from '#server/schemas.ts';
import { elementToPng, zodResolver } from '#utils/index.ts';

import ClassPicker from '../form/ClassPicker';
import IconPicker from '../form/IconPicker';
import Input from '../form/Input';
import UndoRedo from '../form/UndoRedo';
import TextButton from '../styled/TextButton';
import CloneDialog from './CloneDialog';
import DeleteDialog from './DeleteDialog';
import IdxInput from './IdxInput';
import Notes from './Notes';
import PointsSummary from './PointsSummary';
import SaveDialog from './SaveDialog';
import TalentEdit from './TalentEdit';
import TalentPreview from './TalentPreview';

type Props = { defaultValues: TalentFormT };

const TalentBuilder = ({ defaultValues }: Props) => {
	const treeElemRef = useRef<HTMLDivElement>(null);

	const session = useSession();

	const isLocal = !defaultValues.createdById;
	const isNew = !defaultValues.createdAt;

	const editable =
		isNew ||
		isLocal ||
		session.data?.user.role === 'admin' ||
		session.data?.user.id === defaultValues.createdById;

	const formProps = useForm({
		defaultValues,
		resolver: zodResolver(TalentForm)
	});
	const { register, getValues, control, formState } = formProps;

	const [selected, setSelected] = useState(-1);
	const { fields } = useFieldArray({ control, name: 'talents' });

	return (
		<FormProvider {...formProps}>
			<form className="haax-surface-3 flex flex-col gap-3">
				<div className="flex flex-col gap-3 md:flex-row md:items-center">
					<div className="flex grow items-center gap-4 overflow-hidden">
						<IconPicker name="icon" disabled={!editable} />
						<Input
							{...register('name', { setValueAs: v => (v === '' ? null : v) })}
							disabled={!editable}
							className="grow"
							inputClassName="text-3xl"
						/>
					</div>

					<div className="flex shrink items-center">
						<ClassPicker name="class" disabled={!editable} />
						<IdxInput disabled={!editable} />
						{session.data?.user.role === 'admin' && (
							<Input
								placeholder="Collection"
								{...register('collection', {
									setValueAs: v => (v === '' ? null : v)
								})}
								className="shrink grow"
								disabled={!editable}
							/>
						)}

						{editable && <SaveDialog disabled={!formState.isDirty} />}
						{!isNew && <CloneDialog />}
						{editable && <DeleteDialog />}
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
								icon={<Camera />}
								title="Screenshot"
								onClick={() => {
									if (!treeElemRef.current) return;
									elementToPng(treeElemRef.current, getValues().name);
								}}
								className="-m-2"
							/>
							<TextButton
								icon={<NotebookPen />}
								title="Notes"
								onClick={() => setSelected(-1)}
								className="-m-2"
							/>
						</div>
						<div className="absolute bottom-3 left-3 flex flex-col items-start gap-2">
							{isLocal ? (
								<p className="text-blue-gray flex items-center gap-1 text-sm">
									<CloudOff size={14} />
									Local only
								</p>
							) : defaultValues.visibility === 'private' ? (
								<p className="text-warm-green flex items-center gap-1 text-sm">
									<EyeOff size={14} />
									Private
								</p>
							) : (
								<p className="flex items-center gap-1 text-sm">
									<Eye size={14} />
									Public
								</p>
							)}
							{defaultValues.createdBy && (
								<div className="text-blue-gray flex items-center gap-1.5">
									Author:{' '}
									<TextButton
										icon={<UserAvatar image={defaultValues.createdBy?.image} />}
										type="link"
										href={`/profile/${defaultValues.createdById}`}
										className="p-0!"
									>
										<UserRoleText role={defaultValues.createdBy.role}>
											{defaultValues.createdBy.name}
										</UserRoleText>
									</TextButton>
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
