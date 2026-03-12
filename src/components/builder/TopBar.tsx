import { useController, useFormContext } from 'react-hook-form';
import { LibraryBig, NotebookTabs } from 'lucide-react';

import { useSession } from '#auth/client.ts';
import ClassPicker from '#components/form/ClassPicker.tsx';
import IconPicker from '#components/form/IconPicker.tsx';
import Input from '#components/form/Input.tsx';
import {
	GameVersionLogo,
	GameVersions
} from '#components/styled/GameVersion.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import { type TalentForm } from '#server/schemas.ts';
import { nullableInput } from '#utils/index.ts';

import CloneDialog from './CloneDialog';
import DeleteDialog from './DeleteDialog';
import SaveDialog from './SaveDialog';

type Props = { editable?: boolean; isNew?: boolean };

const IdxInput = ({ editable }: Props) => {
	const { field } = useController({ name: 'index' });
	return (
		<TextButton
			icon={<NotebookTabs />}
			disabled={!editable}
			onClick={() => {
				field.onChange((field.value + 1) % 3);
			}}
			className="text-white"
		>
			Tab{field.value + 1}
		</TextButton>
	);
};

const RowsInput = ({ editable }: Props) => {
	const { field } = useController<TalentForm, 'rows'>({ name: 'rows' });
	const idx = Math.max(
		GameVersions.findIndex(v => v.rows === field.value),
		0
	);
	return (
		<Input
			{...field}
			onChange={e => {
				const value = Number(e.target.value);
				if (isNaN(value)) return;
				field.onChange(Math.min(Math.max(value, 1), 11));
			}}
			type="number"
			disabled={!editable}
			before={
				<TextButton
					icon={<GameVersionLogo rows={field.value} />}
					disabled={!editable}
					title={`Game version: ${GameVersions[idx]?.name}`}
					onClick={() => {
						const newValue = (idx + 1) % GameVersions.length;
						field.onChange(GameVersions[newValue]?.rows ?? 5);
						field.onBlur();
					}}
					className="-m-2"
				/>
			}
			after={<span className="grow">rows</span>}
			className="grow [&_input]:w-5 [&_input]:grow-0 [&_input]:text-right"
		/>
	);
};

const TopBar = ({ editable, isNew }: Props) => {
	const session = useSession();
	const { register, formState } = useFormContext<TalentForm>();
	return (
		<div className="flex flex-wrap items-center justify-end gap-2">
			<div className="flex shrink grow items-center gap-2">
				<IconPicker name="icon" disabled={!editable} />
				<Input
					{...register('name', nullableInput)}
					disabled={!editable}
					className="shrink grow [&_input]:text-3xl"
				/>
			</div>

			<div className="flex shrink grow flex-wrap items-center md:grow-0">
				<div className="flex shrink grow items-center">
					<ClassPicker name="class" disabled={!editable} />
					<RowsInput editable={editable} />
					<IdxInput editable={editable} />
				</div>

				<div className="flex shrink grow items-center">
					<Input
						{...register('collection', nullableInput)}
						before={<LibraryBig />}
						placeholder="No collection"
						disabled={session.data?.user?.role !== 'admin'}
						className="shrink grow"
					/>
					{editable && <SaveDialog disabled={!formState.isDirty} />}
					{!isNew && <CloneDialog />}
					{editable && <DeleteDialog />}
				</div>
			</div>
		</div>
	);
};

export default TopBar;
