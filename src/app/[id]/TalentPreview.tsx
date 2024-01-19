'use client';

import { useRef } from 'react';
import { useWatch, useFormContext } from 'react-hook-form';
import cls from 'classnames';

import { type TalentFormT } from '~/server/api/types';

import TalentIcon from '../_components/TalentIcon';
import useTooltip from '../_components/hooks/useTooltip';

const TalentPreview = ({
	i,
	selected,
	setSelected,
	editable
}: {
	i: number;
	selected: number;
	setSelected: (i: number) => void;
	editable?: boolean;
}) => {
	const field = useWatch<TalentFormT, `tree.${number}`>({
		name: `tree.${i}`
	});
	const { setValue, getValues } = useFormContext<TalentFormT>();

	const ref = useRef<HTMLButtonElement>(null);
	const dragging = useRef(false);

	const { tooltipProps, elementProps } = useTooltip(dragging.current);

	if (!field) return null;
	return (
		<>
			<TalentIcon
				ref={ref}
				onClick={e =>
					e.shiftKey && selected
						? setValue(`tree.${selected}.requires`, i)
						: setSelected(i)
				}
				icon={dragging.current ? undefined : field.icon}
				ranks={dragging.current ? undefined : field.ranks}
				selected={dragging.current ? undefined : selected === i}
				highlighted={dragging.current ? undefined : !!field.highlight}
				frameClass={cls({ 'opacity-10': !field.name })}
				arrow={
					!field.requires && field.requires !== 0
						? undefined
						: [field.requires, i]
				}
				draggable={!!editable}
				onDragStart={e => {
					if (!editable) return;
					dragging.current = true;
					const img = ref.current?.querySelector('img');
					img && e.dataTransfer.setDragImage(img, 28, 28);
					e.dataTransfer.setData('text/plain', i.toString());
				}}
				onDragOver={e => {
					if (!editable) return;
					e.preventDefault();
				}}
				onDrop={e => {
					if (!editable) return;
					dragging.current = false;
					e.preventDefault();
					const idx = Number(e.dataTransfer.getData('text/plain'));
					if (i === idx) return;
					const newTree = [...getValues().tree];
					[newTree[i], newTree[idx]] = [newTree[idx]!, newTree[i]!];
					setValue('tree', newTree);
					setSelected(i);
				}}
				{...elementProps}
			/>
			{field.name && (
				<div
					className="tw-surface max-w-[400px] bg-darkerGray/90"
					{...tooltipProps}
				>
					<h4 className="tw-color">{field.name}</h4>
					<p>{field.description}</p>
				</div>
			)}
		</>
	);
};
export default TalentPreview;
