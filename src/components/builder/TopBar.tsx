import { useController, useFormContext, useFormState } from 'react-hook-form';

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
import CollectionsDialog from './CollectionsDialog';
import DeleteDialog from './DeleteDialog';
import SaveDialog from './SaveDialog';

type Props = { editable?: boolean; isNew?: boolean };

const RowsInput = ({ editable }: Props) => {
	const { field } = useController<TalentForm, 'rows'>({ name: 'rows' });
	const version =
		GameVersions.find(v => v.rows === field.value) ?? GameVersions[0];
	return (
		<Input
			{...field}
			onChange={e => {
				const value = Number(e.target.value);
				if (isNaN(value)) return;
				field.onChange(Math.min(Math.max(value, 1), 11));
			}}
			onBlur={field.onBlur}
			type="number"
			disabled={!editable}
			before={
				<TextButton
					icon={<GameVersionLogo rows={field.value} />}
					disabled={!editable}
					title={`Game version: ${version.name}`}
					onClick={() => {
						const idx = Math.max(
							GameVersions.findIndex(v => v.rows === field.value),
							0
						);
						field.onChange(GameVersions[idx + 1]?.rows ?? 5);
						field.onBlur();
					}}
					className="-m-2"
				/>
			}
			after={<span className="grow">rows</span>}
			className="grow [&_input]:w-5 [&_input]:grow-0 [&_input]:text-center"
		/>
	);
};

const TopBar = ({ editable, isNew }: Props) => {
	const { register, control } = useFormContext<TalentForm>();
	const { isDirty } = useFormState({ control });
	return (
		<div className="flex flex-wrap items-center justify-end gap-2">
			<div className="flex shrink grow items-center gap-2">
				<IconPicker name="icon" disabled={!editable} />
				<Input
					placeholder="No tree name..."
					{...register('name', nullableInput)}
					disabled={!editable}
					className="shrink grow [&_input]:text-3xl min-w-64"
				/>
			</div>

			<div className="flex items-center">
				<ClassPicker name="class" disabled={!editable} />
				<RowsInput editable={editable} />
			</div>

			<div className="flex items-center justify-end">
				<CollectionsDialog />
				{editable && <SaveDialog disabled={!isDirty} />}
				{!isNew && <CloneDialog />}
				{editable && <DeleteDialog />}
			</div>
		</div>
	);
};

export default TopBar;
