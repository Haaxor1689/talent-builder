'use client';

import { AlertTriangle, Link2Off, Trash2 } from 'lucide-react';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { Talent, type TalentForm } from '#server/schemas.ts';
import { nullableInput } from '#utils/index.ts';

import CheckboxInput from '../form/CheckboxInput';
import IconPicker from '../form/IconPicker';
import Input from '../form/Input';
import Textarea from '../form/Textarea';
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
			type="number"
			after={<p>rank{field.value !== 1 ? 's' : ''}</p>}
			disabled={!editable}
			className="shrink grow [&_input]:w-3 [&_input]:text-right"
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
		<div className="flex shrink items-center gap-3">
			{requires ? (
				<>
					<SpellIcon icon={requires.icon} className="size-12" showDefault />
					<p className="haax-color shrink grow font-bold">
						{requires.name || '[Unnamed talent]'}
					</p>
				</>
			) : (
				<>
					<AlertTriangle className="m-2 size-8 text-red" />
					<span className="shrink grow text-red">
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

const TalentEdit = ({
	selected,
	setSelected,
	editable
}: Props & {
	setSelected: (i: number) => void;
}) => {
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
		<div className="flex h-full flex-col gap-4 p-3">
			<div className="flex flex-wrap items-center justify-end">
				<div className="flex shrink grow items-center gap-2">
					<IconPicker name={`talents.${selected}.icon`} disabled={!editable} />
					<Input
						placeholder="No talent name..."
						{...register(`talents.${selected}.name`)}
						disabled={!editable}
						className="min-w-48 shrink grow [&_input]:text-xl"
					/>
				</div>

				<div className="flex items-center">
					<RanksInput selected={selected} editable={editable} />
					<CheckboxInput
						name={`talents.${selected}.highlight`}
						label="Highlight"
						disabled={!editable}
					/>
					<TalentScreenshot selected={selected} />
					{editable && (
						<TextButton
							icon={<Trash2 />}
							title="Delete"
							onClick={() => {
								setValue(`talents.${selected}`, undefined, {
									shouldDirty: true,
									shouldTouch: true
								});
								setSelected(-1);
							}}
							className="text-red"
						/>
					)}
				</div>
			</div>

			<Textarea
				{...register(`talents.${selected}.description`, nullableInput)}
				label="Description:"
				disabled={!editable}
				className="shrink grow-2"
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
				label="Spell Ids:"
				disabled={!editable}
				hint="Comma-separated list of spell IDs for each rank (optional)"
			/>
		</div>
	);
};

export default TalentEdit;
