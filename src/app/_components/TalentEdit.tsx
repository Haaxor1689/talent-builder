'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { Link2Off, Trash2 } from 'lucide-react';

import { type TalentFormT } from '../../server/api/types';

import ConfirmDialog from './ConfirmDialog';
import IconPicker from './form/IconPicker';
import Input from './form/Input';
import Textarea from './form/Textarea';
import TextButton from './styled/TextButton';
import TalentIcon from './TalentIcon';
import CheckboxInput from './form/CheckboxInput';

const RequiredTalent = ({
	selected,
	editable
}: {
	selected: number;
	editable?: boolean;
}) => {
	const { setValue } = useFormContext<TalentFormT>();
	const fields = useWatch<TalentFormT, 'tree'>({ name: 'tree' });
	const requires = fields[fields[selected ?? -1]?.requires ?? -1];
	if (!requires) return null;
	return (
		<div className="flex items-center gap-3">
			<TalentIcon icon={requires.icon} className="!size-12" />
			<p className="tw-color grow font-bold">{requires.name}</p>
			{editable && (
				<TextButton
					icon={Link2Off}
					title="Remove link"
					onClick={() => setValue(`tree.${selected}.requires`, null)}
				/>
			)}
		</div>
	);
};

type Props = {
	selected: number;
	editable?: boolean;
	onDelete: () => void;
};

const TalentEdit = ({ selected, editable, onDelete }: Props) => {
	const { register } = useFormContext<TalentFormT>();
	const name = useWatch<TalentFormT, `tree.${number}.name`>({
		name: `tree.${selected}.name`
	});
	return (
		<div className="flex w-full flex-col gap-4 md:max-w-md">
			<div className="flex items-center gap-2">
				<IconPicker name={`tree.${selected}.icon`} disabled={!editable} />
				<Input
					{...register(`tree.${selected}.name`)}
					disabled={!editable}
					className="flex-grow"
				/>
				{editable && (
					<ConfirmDialog
						title={`Are you sure you want to delete "${name}"?`}
						confirm={onDelete}
					>
						{open => (
							<TextButton
								onClick={open}
								className="text-red-500"
								icon={Trash2}
								title="Delete"
							/>
						)}
					</ConfirmDialog>
				)}
			</div>
			<Input
				{...register(`tree.${selected}.ranks`, { valueAsNumber: true })}
				label="Ranks"
				type="number"
				disabled={!editable}
			/>
			<Textarea
				{...register(`tree.${selected}.description`)}
				label="Text"
				minRows={5}
				disabled={!editable}
			/>

			<div className="flex flex-col gap-2">
				<span>Requires:</span>
				<RequiredTalent selected={selected} editable={editable} />
				<p className="text-blueGray">
					Shift + click other talent to set dependency
				</p>
			</div>
			<div className="flex flex-col">
				<span>Other options:</span>
				<CheckboxInput
					name={`tree.${selected}.highlight`}
					label="Highlight change"
					disabled={!editable}
				/>
			</div>
		</div>
	);
};

export default TalentEdit;
