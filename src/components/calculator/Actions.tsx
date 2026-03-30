import { Copy, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { useSession } from '#auth/client.ts';
import SlugInput from '#components/form/SlugInput.tsx';
import useAsyncAction from '#hooks/useAsyncAction.tsx';
import { upsertSavedBuild } from '#server/api/savedBuilds.actions.ts';
import { type BuildForm, type TalentForm } from '#server/schemas.ts';
import { invoke, maskToClass } from '#utils/index.ts';

import Input from '../form/Input';
import Dialog, { closeDialog } from '../styled/Dialog';
import TextButton from '../styled/TextButton';
import { toast } from '../ToastProvider';
import DeleteDialog from './DeleteDialog';
import { bitPack } from './utils';

type Props = {
	trees: [TalentForm?, TalentForm?, TalentForm?];
	isNew?: boolean;
};

const Actions = ({ trees, isNew }: Props) => {
	const { register, getValues, reset, control } = useFormContext<BuildForm>();
	const [isPending, startTransition] = useAsyncAction();

	const session = useSession();
	const router = useRouter();

	const id = useWatch({ name: 'id', control });
	const name = useWatch({ name: 'name', control });
	const slug = useController({ name: 'slug', control });
	const cls = useWatch({ name: 'class', control });
	const createdById = useWatch({ name: 'createdById', control });

	const editable =
		session.data?.user.role === 'admin' ||
		session.data?.user.id === createdById;

	const fullName = `${name ? `${name} ` : ''}${maskToClass(cls)?.name}`;

	if (!session.data) return null;
	return (
		<>
			<hr />
			<div className="flex justify-end gap-2">
				<Dialog
					trigger={open => (
						<TextButton
							icon={<Save />}
							title="Save build"
							onClick={open}
							disabled={isPending || trees.some(t => !t)}
						/>
					)}
				>
					<h3 className="haax-color">Save build</h3>
					<hr />
					<Input {...register('name')} label="Build name" />
					<SlugInput
						placeholder={id}
						slug={slug.field.value}
						setSlug={value => slug.field.onChange(value)}
						url="/calculator/"
					/>
					<p className="text-blue-gray">
						You can save custom builds to share them or access them later. After
						saving, you&apos;ll get a unique URL that you can bookmark or share
						with others.
					</p>
					<hr />
					<TextButton
						icon={<Save />}
						onClick={startTransition(async currentTarget => {
							const values = getValues();
							const newBuild = await invoke(
								upsertSavedBuild({
									...values,
									tree0Id: trees[0]?.id ?? '',
									tree1Id: trees[1]?.id ?? '',
									tree2Id: trees[2]?.id ?? ''
								})
							);
							toast({ message: 'Build saved!', type: 'success' });
							router.push(`/calculator/${values.id}`);
							newBuild && reset(newBuild);
							closeDialog({ currentTarget });
						})}
						loading={isPending}
						className="-m-2 self-end"
					>
						Save
					</TextButton>
				</Dialog>

				{!isNew && (
					<TextButton
						icon={<Copy />}
						title="Clone"
						onClick={startTransition(async () => {
							const values = getValues();
							const newUrl = `/calculator?${new URLSearchParams({
								class: values.class.toString(),
								points: bitPack(values.points),
								rows: values.rows.toString(),
								t0: trees[0]?.id ?? '',
								t1: trees[1]?.id ?? '',
								t2: trees[2]?.id ?? ''
							}).toString()}`;
							toast({ message: 'New copy created!', type: 'success' });
							router.push(newUrl);
						})}
						disabled={isPending || trees.some(t => !t)}
					/>
				)}

				{!isNew && editable && <DeleteDialog name={fullName} />}
			</div>
		</>
	);
};

export default Actions;
