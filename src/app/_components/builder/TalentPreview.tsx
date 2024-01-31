'use client';

import { useRef } from 'react';
import { useWatch, useFormContext } from 'react-hook-form';
import cls from 'classnames';
import { cloneDeep, isEqual } from 'lodash-es';

import { EmptyTalent, type TalentFormT } from '~/server/api/types';

import useTooltip from '../hooks/useTooltip';

import TalentIcon from './TalentIcon';

const isEmptyTalent = (talent?: TalentFormT['tree'][number]) =>
	!talent || isEqual(talent, EmptyTalent());

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
					!e.shiftKey || !editable
						? setSelected(i)
						: selected === i
						? setValue(`tree.${selected}.requires`, null, {
								shouldDirty: true,
								shouldTouch: true
						  })
						: setValue(`tree.${selected}.requires`, i, {
								shouldDirty: true,
								shouldTouch: true
						  })
				}
				onKeyDown={e => {
					if (!editable || e.key !== 'Delete') return;
					setValue(`tree.${selected}`, EmptyTalent(), {
						shouldDirty: true,
						shouldTouch: true
					});
				}}
				icon={dragging.current ? '' : field.icon}
				ranks={dragging.current ? undefined : field.ranks}
				selected={dragging.current ? undefined : selected === i}
				highlighted={dragging.current ? undefined : !!field.highlight}
				frameClass={cls({ 'opacity-10': !field.name })}
				arrow={
					!field.requires && field.requires !== 0
						? undefined
						: [field.requires, i]
				}
				onDragStart={e => {
					if (!editable || isEmptyTalent(field)) {
						e.preventDefault();
						return;
					}

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

					const cloned = cloneDeep(getValues().tree);

					const [a, b] = [cloned[i], cloned[idx]];
					cloned[i] = { ...EmptyTalent(), ...b };
					cloned[idx] = { ...EmptyTalent(), ...a };

					setValue('tree', cloned, {
						shouldDirty: true,
						shouldTouch: true
					});
					setSelected(i);
				}}
				{...elementProps}
			/>
			{(field.icon || field.name || field.description) && (
				<div
					className="tw-surface max-w-[400px] bg-darkerGray/90"
					{...tooltipProps}
				>
					{/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
					<h4 className="tw-color">{field.name || '[Unnamed talent]'}</h4>
					{/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
					<p>{field.description || '[No description]'}</p>
				</div>
			)}
		</>
	);
};
export default TalentPreview;
