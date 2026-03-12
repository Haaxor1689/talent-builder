'use client';

import { useController, useFormContext, useWatch } from 'react-hook-form';
import { AlertTriangle, Link2Off, Trash2 } from 'lucide-react';

import { Talent, type TalentForm } from '#server/schemas.ts';
import { nullableInput } from '#utils/index.ts';

import CheckboxInput from '../form/CheckboxInput';
import IconPicker from '../form/IconPicker';
import Input from '../form/Input';
import Textarea from '../form/Textarea';
import ScrollArea from '../styled/ScrollArea';
import SpellIcon from '../styled/SpellIcon';
import TextButton from '../styled/TextButton';
import TalentScreenshot from './TalentScreenshot';

type Props = {
	selected: number;
	editable?: boolean;
};

const RanksInput = ({ selected, editable }: Props) => {
	const { field } = useController<TalentForm, `talents.${number}.ranks`>({
		name: `talents.${selected}.ranks`
	});
	return (
		<Input
			{...field}
			onChange={e => {
				const value = Number(e.target.value);
				if (isNaN(value)) return;
				field.onChange(Math.min(Math.max(value, 0), 7));
			}}
			label="Ranks"
			type="number"
			disabled={!editable}
			className="grow"
		/>
	);
};

const RequiredTalent = ({ selected, editable }: Props) => {
	const { setValue } = useFormContext<TalentForm>();
	const fields = useWatch<TalentForm, 'talents'>({ name: 'talents' });
	const requiresId = fields?.[selected]?.requires;
	const requires = fields?.[requiresId ?? -1];
	if (!requires && !editable) return <p className="text-blue-gray">Nothing</p>;
	if (typeof requiresId !== 'number' && !requires) return null;
	return (
		<div className="flex items-center gap-3">
			{requires ? (
				<>
					<SpellIcon icon={requires.icon} className="size-12" showDefault />
					<p className="haax-color grow font-bold">
						{requires.name || '[Unnamed talent]'}
					</p>
				</>
			) : (
				<>
					<AlertTriangle className="text-red m-2 size-8" />
					<span className="text-red grow">
						Missing talent #{requiresId}. Please change this link.
					</span>
				</>
			)}

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

const TalentEdit = ({ selected, editable }: Props) => {
	const { register, setValue } = useFormContext<TalentForm>();
	const field = useWatch<TalentForm, `talents.${number}`>({
		name: `talents.${selected}`
	});

	if (!field)
		return (
			<TextButton
				onClick={() =>
					setValue(`talents.${selected}`, Talent.parse({}), {
						shouldDirty: true,
						shouldTouch: true
					})
				}
				className="h-full w-full flex-col items-center justify-center p-12"
			>
				<p className="h1 text-7xl text-inherit">+</p>
				<p className="h3 whitespace-nowrap text-inherit">Add talent</p>
			</TextButton>
		);

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
					className="mx-2 shrink grow [&_input]:text-xl"
				/>

				<TalentScreenshot selected={selected} />
				{editable && (
					<TextButton
						icon={<Trash2 />}
						title="Delete"
						onClick={() =>
							setValue(`talents.${selected}`, undefined, {
								shouldDirty: true,
								shouldTouch: true
							})
						}
						className="text-red"
					/>
				)}
			</div>

			<div className="flex items-end gap-2">
				<RanksInput selected={selected} editable={editable} />
				<CheckboxInput
					name={`talents.${selected}.highlight`}
					label="Highlight change"
					disabled={!editable}
				/>
			</div>

			<Textarea
				{...register(`talents.${selected}.description`, nullableInput)}
				label="Text"
				disabled={!editable}
				className="min-h-48 shrink grow"
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
				{...register(`talents.${selected}.spellIds`, nullableInput)}
				label="Spell Ids"
				disabled={!editable}
				hint="Comma-separated list of spell IDs for each rank (optional)"
			/>
		</ScrollArea>
	);
};

export default TalentEdit;
