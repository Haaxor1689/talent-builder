'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { Camera, Link2Off, Trash2 } from 'lucide-react';
import { useMemo, useRef } from 'react';

import { Talent, type TalentFormT } from '~/server/api/types';
import { elementToPng } from '~/utils';

import IconPicker from '../form/IconPicker';
import Input from '../form/Input';
import Textarea from '../form/Textarea';
import TextButton from '../styled/TextButton';
import CheckboxInput from '../form/CheckboxInput';
import SpellIcon from '../styled/SpellIcon';
import DialogButton from '../styled/DialogButton';
import { formatTalentDescription } from '../calculator/formatTalentDescription';

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
	if (!requires && !editable) return <p className="text-blueGray">Nothing</p>;
	if (!requires) return null;
	return (
		<div className="flex items-center gap-3">
			<SpellIcon icon={requires.icon} className="!size-12" showDefault />
			<p className="tw-color grow font-bold">
				{/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
				{requires.name || '[Unnamed talent]'}
			</p>
			{editable && (
				<TextButton
					icon={Link2Off}
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

const TalentScreenshot = ({ selected }: { selected: number }) => {
	const ref = useRef<HTMLDivElement>(null);

	const item = useWatch({ name: `talents.${selected}` });

	const description = useMemo(
		() => formatTalentDescription(item),
		[item.description, item.ranks]
	);

	return (
		<div className="flex justify-end">
			<DialogButton
				clickAway
				dialog={close => (
					<div className="flex flex-col items-center gap-4">
						<TextButton
							icon={Camera}
							onClick={async () => {
								if (!ref.current) return;
								await elementToPng(ref.current, item.name);
								close();
							}}
						>
							Save screenshot
						</TextButton>
						<div ref={ref} className="flex items-start gap-2">
							<SpellIcon icon={item.icon} showDefault />
							<div className="tw-surface pointer-events-none z-10 min-w-[250px] max-w-[400px] bg-darkerGray/90">
								<h4 className="tw-color">{item.name || '[Empty talent]'}</h4>
								<p className="whitespace-pre-wrap">
									{description ?? '[No description]'}
								</p>
							</div>
						</div>
					</div>
				)}
			>
				{open => <TextButton icon={Camera} title="Screenshot" onClick={open} />}
			</DialogButton>
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
				<IconPicker name={`talents.${selected}.icon`} disabled={!editable} />
				<Input
					{...register(`talents.${selected}.name`)}
					disabled={!editable}
					className="grow"
				/>

				{editable && (
					<TextButton
						onClick={() =>
							setValue(`talents.${selected}`, Talent.parse({}), {
								shouldDirty: true,
								shouldTouch: true
							})
						}
						className="text-red"
						icon={Trash2}
						title="Delete"
					/>
				)}
			</div>

			<Input
				{...register(`talents.${selected}.ranks`, { valueAsNumber: true })}
				label="Ranks"
				type="number"
				disabled={!editable}
			/>

			<Textarea
				{...register(`talents.${selected}.description`)}
				label="Text"
				minRows={5}
				maxRows={14}
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

			<CheckboxInput
				name={`talents.${selected}.highlight`}
				label="Highlight change"
				disabled={!editable}
			/>

			<Input {...register(`talents.${selected}.spellIds`)} label="Spell Ids" />
			<span className="-mt-2 text-sm text-blueGray">
				Comma separated list of spell ids for each rank
			</span>

			<TalentScreenshot selected={selected} />
		</div>
	);
};

export default TalentEdit;
