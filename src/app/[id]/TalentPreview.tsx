'use client';

import { useWatch, useFormContext } from 'react-hook-form';
import cls from 'classnames';

import { type TalentFormT } from '~/server/api/types';

import TalentIcon from '../_components/TalentIcon';
import Tooltip from '../_components/styled/Tooltip';

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
	if (!field) return null;
	return (
		<Tooltip
			tooltip={
				field.name ? (
					<div className="tw-surface left-5 top-5 max-w-[400px] bg-darkerGray/90">
						<h4 className="tw-color">{field.name}</h4>
						<p>{field.description}</p>
					</div>
				) : null
			}
		>
			<TalentIcon
				onClick={e =>
					e.shiftKey && selected
						? setValue(`tree.${selected}.requires`, i)
						: setSelected(i)
				}
				icon={field.icon}
				ranks={field.ranks}
				selected={selected === i}
				frameClass={cls({ 'opacity-10': !field.name })}
				arrow={
					!field.requires && field.requires !== 0
						? undefined
						: [field.requires, i]
				}
				draggable={!!editable}
				onDragStart={e => {
					if (!editable) return;
					const img = new Image();
					img.src = `https://wow.zamimg.com/images/wow/icons/large/${field.icon}.jpg`;
					e.dataTransfer.setDragImage(img, 28, 28);
					e.dataTransfer.setData('text/plain', i.toString());
				}}
				onDragOver={e => {
					if (!editable) return;
					e.preventDefault();
				}}
				onDrop={e => {
					if (!editable) return;
					e.preventDefault();
					const idx = Number(e.dataTransfer.getData('text/plain'));
					if (i === idx) return;
					const newTree = [...getValues().tree];
					[newTree[i], newTree[idx]] = [newTree[idx]!, newTree[i]!];
					setValue('tree', newTree);
					setSelected(i);
				}}
			/>
		</Tooltip>
	);
};
export default TalentPreview;
