'use client';

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { cloneDeep } from 'es-toolkit';
import { Link2, Pointer, Replace } from 'lucide-react';

import { TalentDescription } from '#components/styled/TalentDescription.tsx';
import { type TalentForm } from '#server/schemas.ts';

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
	const field = useWatch<TalentForm, `talents.${number}`>({
		name: `talents.${i}`
	});
	const { setValue, getValues } = useFormContext<TalentForm>();

	const [dragging, setDragging] = useState(false);

	const swapTalents = (lhs: number, rhs: number) => {
		if (lhs === rhs) return;
		const cloned = cloneDeep(getValues().talents);

		const [a, b] = [cloned[lhs], cloned[rhs]];
		cloned[lhs] = b as never;
		cloned[rhs] = a as never;

		setValue('talents', cloned, {
			shouldDirty: true,
			shouldTouch: true
		});
		setSelected(i);
	};

	if (!field && !editable) return <div className="size-16" />;

	return (
		<Tooltip
			hidden={dragging || !field}
			tooltip={
				<>
					<p className="haax-color h4">{field?.name ?? '[Empty talent]'}</p>
					<TalentDescription field={field} />
				</>
			}
			actions={
				selected !== i && (
					<>
						{selected !== -1 && (
							<>
								<TextButton
									icon={<Link2 />}
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
									icon={<Replace />}
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
							icon={<Pointer />}
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
						setValue(`talents.${selected}`, undefined, {
							shouldDirty: true,
							shouldTouch: true
						});
					}}
					icon={field?.icon}
					showDefault={selected === i || !!field}
					ranks={field?.ranks}
					selected={selected === i}
					onDragStart={e => {
						if (!editable || !field) {
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
					extraContent={
						<>
							{typeof field?.requires === 'number' && (
								<TalentArrow start={field.requires} end={i} />
							)}
							{!!field?.highlight && (
								<img
									src="/icon_hover.png"
									alt="hover"
									className="pointer-events-none absolute inset-0 size-full scale-125 animate-pulse -hue-rotate-90"
								/>
							)}
						</>
					}
					{...props}
					className={
						!field
							? "*:[[alt='frame']]:opacity-10 *:[[alt='icon']]:opacity-10"
							: undefined
					}
				/>
			)}
		</Tooltip>
	);
};
export default TalentPreview;
