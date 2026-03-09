'use client';

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import cls from 'classnames';
import { cloneDeep } from 'es-toolkit';
import { Link2, Pointer, Replace } from 'lucide-react';

import { Talent, type TalentFormT } from '#server/schemas.ts';
import { isEmptyTalent } from '#utils/index.ts';

import { formatTalentDescription } from '../calculator/formatTalentDescription';
import { closeDialog } from '../styled/Dialog';
import SpellIcon from '../styled/SpellIcon';
import TalentArrow from '../styled/TalentArrow';
import TextButton from '../styled/TextButton';
import Tooltip from '../styled/Tooltip';

type Props = {
	i: number;
	selected: number;
	setSelected: (i: number) => void;
	editable?: boolean;
};

const TalentPreview = ({ i, selected, setSelected, editable }: Props) => {
	const field = useWatch<TalentFormT, `talents.${number}`>({
		name: `talents.${i}`
	});
	const { setValue, getValues } = useFormContext<TalentFormT>();

	const [dragging, setDragging] = useState(false);

	const isEmpty = isEmptyTalent(field);

	const description = formatTalentDescription(field);

	const swapTalents = (lhs: number, rhs: number) => {
		if (lhs === rhs) return;
		const cloned = cloneDeep(getValues().talents);

		const [a, b] = [cloned[lhs], cloned[rhs]];
		cloned[lhs] = { ...Talent.parse({}), ...b };
		cloned[rhs] = { ...Talent.parse({}), ...a };

		setValue('talents', cloned, {
			shouldDirty: true,
			shouldTouch: true
		});
		setSelected(i);
	};

	if (!field) return null;
	return (
		<Tooltip
			hidden={dragging || isEmpty}
			tooltip={
				<>
					<p className="haax-color h4">{field.name || '[Empty talent]'}</p>
					<p
						className={cls('whitespace-pre-wrap', {
							['text-blue-gray']: !description
						})}
					>
						{description ?? '[No description]'}
					</p>
				</>
			}
			actions={
				selected !== i && (
					<>
						{selected !== -1 && (
							<>
								<TextButton
									icon={Link2}
									onClick={e => {
										setValue(`talents.${selected}.requires`, i, {
											shouldDirty: true,
											shouldTouch: true
										});
										closeDialog(e);
									}}
								>
									Link as requirement
								</TextButton>
								<TextButton
									icon={Replace}
									onClick={e => {
										swapTalents(i, selected);
										closeDialog(e);
									}}
								>
									Swap with selected
								</TextButton>
							</>
						)}
						<TextButton
							icon={Pointer}
							onClick={e => {
								setSelected(i);
								closeDialog(e);
							}}
						>
							Select
						</TextButton>
					</>
				)
			}
		>
			{props => (
				<SpellIcon
					onClick={e => {
						if (e.shiftKey && editable && selected !== -1) {
							setValue(
								`talents.${selected}.requires`,
								selected === i ? null : i,
								{ shouldDirty: true, shouldTouch: true }
							);
						} else {
							setSelected(selected === i ? -1 : i);
						}
					}}
					onKeyDown={e => {
						if (!editable || e.key !== 'Delete') return;
						setValue(`talents.${selected}`, Talent.parse({}), {
							shouldDirty: true,
							shouldTouch: true
						});
					}}
					icon={field.icon}
					ranks={field.ranks}
					selected={selected === i}
					onDragStart={e => {
						if (!editable || isEmpty) {
							e.preventDefault();
							return;
						}

						setDragging(true);
						e.dataTransfer.setData('text/plain', i.toString());
						window.addEventListener('dragend', () => setDragging(false), {
							once: true
						});
					}}
					onDragOver={e => {
						if (!editable) return;
						e.preventDefault();
					}}
					onDrop={e => {
						if (!editable) return;
						e.preventDefault();
						const idx = Number(e.dataTransfer.getData('text/plain'));
						swapTalents(i, idx);
					}}
					showDefault={!isEmpty}
					extraContent={
						<>
							{field.requires !== null && (
								<TalentArrow start={field.requires} end={i} />
							)}
							{!!field.highlight && (
								<span className="text-pink h2 pointer-events-none absolute -top-3 -right-2.5 animate-pulse">
									!!
								</span>
							)}
						</>
					}
					{...props}
					className="*:[[alt='frame']]:opacity-10"
				/>
			)}
		</Tooltip>
	);
};
export default TalentPreview;
