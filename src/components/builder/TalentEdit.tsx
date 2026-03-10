'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { Link2Off, Trash2 } from 'lucide-react';

import { Talent, type TalentFormT } from '#server/schemas.ts';

import CheckboxInput from '../form/CheckboxInput';
import IconPicker from '../form/IconPicker';
import Input from '../form/Input';
import Textarea from '../form/Textarea';
import ScrollArea from '../styled/ScrollArea';
import SpellIcon from '../styled/SpellIcon';
import TextButton from '../styled/TextButton';
import TalentScreenshot from './TalentScreenshot';

const RequiredTalent = ({
	selected,
	editable
}: {
	selected: number;
	editable?: boolean;
}) => {
	const { setValue } = useFormContext<TalentFormT>();
	const fields = useWatch<TalentFormT, 'talents'>({ name: 'talents' });
	const requires = fields[fields[selected ?? -1]?.requires ?? -1];
	if (!requires && !editable) return <p className="text-blue-gray">Nothing</p>;
	if (!requires) return null;
	return (
		<div className="flex items-center gap-3">
			<SpellIcon icon={requires.icon} className="size-12" showDefault />
			<p className="haax-color grow font-bold">
				{requires.name || '[Unnamed talent]'}
			</p>
			{editable && (
				<TextButton
					icon={<Link2Off />}
					title="Remove link"
					onClick={() =>
						setValue(`talents.${selected}.requires`, null, {
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
		<ScrollArea
			containerClassName="h-full"
			contentClassName="flex flex-col gap-4 p-3 h-full"
		>
			<div className="flex items-center">
				<IconPicker name={`talents.${selected}.icon`} disabled={!editable} />
				<Input
					{...register(`talents.${selected}.name`)}
					disabled={!editable}
					className="mx-2 shrink grow"
					inputClassName="text-xl"
				/>
				<TalentScreenshot selected={selected} />
				{editable && (
					<TextButton
						icon={<Trash2 />}
						title="Delete"
						onClick={() =>
							setValue(`talents.${selected}`, Talent.parse({}), {
								shouldDirty: true,
								shouldTouch: true
							})
						}
						className="text-red"
					/>
				)}
			</div>

			<div className="flex items-end gap-2">
				<Input
					{...register(`talents.${selected}.ranks`, { valueAsNumber: true })}
					label="Ranks"
					type="number"
					disabled={!editable}
					className="grow"
				/>

				<CheckboxInput
					name={`talents.${selected}.highlight`}
					label="Highlight change"
					disabled={!editable}
				/>
			</div>

			<Textarea
				{...register(`talents.${selected}.description`)}
				label="Text"
				minRows={5}
				maxRows={14}
				disabled={!editable}
				className="grow"
			/>

			<div className="flex flex-col gap-2">
				<span>Requires:</span>
				<RequiredTalent selected={selected} editable={editable} />
				{editable && (
					<p className="text-blue-gray">
						Shift + click other talent to set dependency
					</p>
				)}
			</div>

			<Input
				{...register(`talents.${selected}.spellIds`)}
				label="Spell Ids"
				disabled={!editable}
			/>
			<span className="text-blue-gray -mt-2 text-sm">
				Comma separated list of spell ids for each rank
			</span>
		</ScrollArea>
	);
};

export default TalentEdit;
