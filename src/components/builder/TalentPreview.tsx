'use client';

import { cloneDeep } from 'es-toolkit';
import { Link2, Pointer, Replace } from 'lucide-react';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { TalentDescription } from '#components/styled/TalentDescription.tsx';
import { Talent, type TalentForm } from '#server/schemas.ts';

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
				field ? (
					<>
						<p className="haax-color h4">{field?.name ?? '[Empty talent]'}</p>
						<TalentDescription field={field} />
					</>
				) : (
					<p className="text-blue-gray">Empty slot</p>
				)
			}
			actions={
				selected !== i && (
					<>
						{selected !== -1 && (
							<>
								{field && (
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
								)}
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
						{field ? (
							<TextButton
								icon={<Pointer />}
								onClick={e => {
									setSelected(i);
									closeDialog(e);
								}}
							>
								Select
							</TextButton>
						) : (
							<TextButton
								icon={<p className="-my-4 pr-1 pb-1.5 h1">+</p>}
								onClick={e => {
									setSelected(i);
									setValue(`talents.${i}`, Talent.parse({}), {
										shouldDirty: true,
										shouldTouch: true
									});
									closeDialog(e);
								}}
							>
								Add talent
							</TextButton>
						)}
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
						e.stopPropagation();
						if (!editable || !field) {
							e.preventDefault();
							return;
						}

						setDragging(true);
						e.dataTransfer.setData('text', `idx:${i}`);
						e.dataTransfer.dropEffect = 'move';
						e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
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
						const idx = e.dataTransfer.getData('text').match(/idx:(\d+)/)?.[1];
						if (!idx) return;
						swapTalents(i, Number(idx));
					}}
					extraContent={
						!dragging && (
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
						)
					}
					{...props}
					className={
						!field ? "*:[img:not([alt='hover'])]:opacity-10" : undefined
					}
				/>
			)}
		</Tooltip>
	);
};
export default TalentPreview;
