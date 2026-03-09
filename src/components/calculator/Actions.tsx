import { useTransition } from 'react';
import { useFormContext } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Copy, Save } from 'lucide-react';

import { useSession } from '#auth/client.ts';
import { upsertSavedBuild } from '#server/api/savedBuilds.actions.ts';
import { type BuildFormT, type TalentFormT } from '#server/schemas.ts';
import { maskToClass } from '#utils/index.ts';

import Input from '../form/Input';
import Dialog, { closeDialog } from '../styled/Dialog';
import TextButton from '../styled/TextButton';
import { toast } from '../ToastProvider';
import DeleteDialog from './DeleteDialog';

type Props = {
	trees: [TalentFormT?, TalentFormT?, TalentFormT?];
	isNew?: boolean;
};

const Actions = ({ trees, isNew }: Props) => {
	const { register, getValues, reset, watch } = useFormContext<BuildFormT>();
	const [isPending, startTransition] = useTransition();

	const session = useSession();
	const router = useRouter();

	const editable =
		session.data?.user.role === 'admin' ||
		session.data?.user.id === watch('createdById');

	const name = watch('name');
	const fullName = `${name ? `${name} ` : ''}${
		maskToClass(watch('class'))?.name
	}`;

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
					<div className="haax-surface-3">
						<h3 className="haax-color">Save build</h3>
						<Input {...register('name')} label="Build name" />
						<TextButton
							onClick={e => {
								const currentTarget = e.currentTarget;
								startTransition(async () => {
									const values = getValues();
									const newBuild = await upsertSavedBuild({
										...values,
										tree0Id: trees[0]?.id ?? '',
										tree1Id: trees[1]?.id ?? '',
										tree2Id: trees[2]?.id ?? ''
									});
									toast({ message: 'Build saved!', type: 'success' });
									router.push(`/calculator/${values.id}`);
									newBuild && reset(newBuild);
									closeDialog({ currentTarget });
								});
							}}
							className="self-end"
						>
							Save
						</TextButton>
					</div>
				</Dialog>

				{!isNew && (
					<TextButton
						icon={<Copy />}
						title="Clone"
						onClick={() =>
							startTransition(async () => {
								const values = getValues();
								const newUrl = `/calculator?${new URLSearchParams({
									c: values.class.toString(),
									t: values.points.map(p => p.join('')).join('-'),
									t0: trees[0]?.id ?? '',
									t1: trees[1]?.id ?? '',
									t2: trees[2]?.id ?? ''
								}).toString()}`;
								toast({ message: 'New copy created!', type: 'success' });
								router.push(newUrl);
							})
						}
						disabled={isPending || trees.some(t => !t)}
					/>
				)}

				{!isNew && editable && <DeleteDialog name={fullName} />}
			</div>
		</>
	);
};

export default Actions;
