'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { Link2Off, Trash2 } from 'lucide-react';

import { EmptyTalent, type TalentFormT } from '~/server/api/types';

import IconPicker from '../form/IconPicker';
import Input from '../form/Input';
import Textarea from '../form/Textarea';
import TextButton from '../styled/TextButton';
import CheckboxInput from '../form/CheckboxInput';

import TalentIcon from './TalentIcon';

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
	if (!requires && !editable) return <p className="text-blueGray">Nothing</p>;
	if (!requires) return null;
	return (
		<div className="flex items-center gap-3">
			<TalentIcon icon={requires.icon} className="!size-12" showDefault />
			<p className="tw-color grow font-bold">
				{/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
				{requires.name || '[Unnamed talent]'}
			</p>
			{editable && (
				<TextButton
					icon={Link2Off}
					title="Remove link"
					onClick={() =>
						setValue(`tree.${selected}.requires`, null, {
							shouldDirty: true,
							shouldTouch: true
						})
					}
				/>
			)}
		</div>
	);
};

type Props = {
	selected: number;
	editable?: boolean;
};

const TalentEdit = ({ selected, editable }: Props) => {
	const { register, setValue } = useFormContext<TalentFormT>();
	return (
		<div className="flex w-full flex-col gap-4 md:max-w-md">
			<div className="flex items-center gap-2">
				<IconPicker name={`tree.${selected}.icon`} disabled={!editable} />
				<Input
					{...register(`tree.${selected}.name`)}
					disabled={!editable}
					className="grow"
				/>
				{editable && (
					<TextButton
						onClick={() =>
							setValue(`tree.${selected}`, EmptyTalent(), {
								shouldDirty: true,
								shouldTouch: true
							})
						}
						className="text-red-500"
						icon={Trash2}
						title="Delete"
					/>
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
				{editable && (
					<p className="text-blueGray">
						Shift + click other talent to set dependency
					</p>
				)}
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
