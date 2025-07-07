import { useFormContext } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { Save, Copy, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import { type TalentFormT, type BuildFormT } from '~/server/api/types';
import {
	upsertSavedBuild,
	deleteSavedBuild
} from '~/server/api/routers/savedBuilds';
import { maskToClass } from '~/utils';
import useAsyncAction from '~/hooks/useAsyncAction';

import ConfirmDialog from '../ConfirmDialog';
import Input from '../form/Input';
import DialogButton from '../styled/DialogButton';
import TextButton from '../styled/TextButton';

type Props = {
	trees: [TalentFormT?, TalentFormT?, TalentFormT?];
	isNew?: boolean;
};

const Actions = ({ trees, isNew }: Props) => {
	const { register, getValues, reset, watch } = useFormContext<BuildFormT>();
	const a = useAsyncAction();

	const session = useSession();
	const router = useRouter();

	const editable =
		session.status === 'authenticated' &&
		(session.data.user.isAdmin ||
			session.data.user.id === watch('createdById'));

	const name = watch('name');
	const fullName = `${name ? `${name} ` : ''}${
		maskToClass(watch('class'))?.name
	}`;

	if (session.status !== 'authenticated') return null;
	return (
		<>
			<hr />
			<div className="flex justify-end gap-2">
				<DialogButton
					dialog={close => (
						<div className="tw-surface flex flex-col gap-2 bg-darkGray/90">
							<h3 className="tw-color">Save build</h3>
							<Input {...register('name')} label="Build name" />
							<TextButton
								onClick={a.action(async () => {
									const values = getValues();
									const newBuild = await upsertSavedBuild({
										...values,
										tree0Id: trees[0]?.id ?? '',
										tree1Id: trees[1]?.id ?? '',
										tree2Id: trees[2]?.id ?? ''
									});
									toast.success('Build saved!');
									router.push(`/calculator/${values.id}`);
									newBuild && reset(newBuild);
									close();
								})}
								className="self-end"
							>
								Save
							</TextButton>
						</div>
					)}
					clickAway
				>
					{open => (
						<TextButton
							onClick={open}
							icon={Save}
							title="Save build"
							disabled={a.loading || trees.some(t => !t)}
						/>
					)}
				</DialogButton>

				{!isNew && (
					<TextButton
						onClick={a.action(async () => {
							const values = getValues();
							const newUrl = `/calculator?${new URLSearchParams({
								c: values.class.toString(),
								t: values.points.map(p => p.join('')).join('-'),
								t0: trees[0]?.id ?? '',
								t1: trees[1]?.id ?? '',
								t2: trees[2]?.id ?? ''
							}).toString()}`;
							toast.success('New copy created!');
							router.push(newUrl);
						})}
						icon={Copy}
						title="Clone"
						disabled={a.loading || trees.some(t => !t)}
					/>
				)}

				{!isNew && editable && (
					<ConfirmDialog
						title={`Are you sure you want to delete "${fullName}" build?`}
						confirm={a.action(async () => {
							const values = getValues();
							await deleteSavedBuild(values.id);

							router.push('/calculator');
						})}
					>
						{open => (
							<TextButton
								onClick={open}
								icon={Trash2}
								title="Delete"
								className={editable ? 'text-red' : undefined}
								disabled={a.loading}
							/>
						)}
					</ConfirmDialog>
				)}
			</div>
		</>
	);
};

export default Actions;
