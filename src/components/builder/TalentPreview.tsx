'use client';

import { useMemo, useRef } from 'react';
import { useWatch, useFormContext } from 'react-hook-form';
import cls from 'classnames';
import { cloneDeep } from 'lodash-es';
import { Link2, Pointer, Replace } from 'lucide-react';

import { Talent, type TalentFormT } from '~/server/api/types';
import { isEmptyTalent } from '~/utils';

import SpellIcon from '../styled/SpellIcon';
import Tooltip from '../styled/Tooltip';
import TextButton from '../styled/TextButton';
import { formatTalentDescription } from '../calculator/formatTalentDescription';

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

	const ref = useRef<HTMLButtonElement>(null);
	const dragging = useRef(false);

	const isEmpty = isEmptyTalent(field);

	const description = useMemo(
		() => formatTalentDescription(field),
		[field.description, field.ranks]
	);

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
			hide={dragging.current || isEmpty}
			hideMobile={false}
			tooltip={
				<>
					{/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
					<h4 className="tw-color">{field.name || '[Empty talent]'}</h4>
					{/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
					<p
						className={cls('whitespace-pre-wrap', {
							['text-blueGray']: !description
						})}
					>
						{description ?? '[No description]'}
					</p>
				</>
			}
			actions={close =>
				selected !== i && (
					<>
						{selected !== -1 && (
							<>
								<TextButton
									icon={Link2}
									onClick={() => {
										setValue(`talents.${selected}.requires`, i, {
											shouldDirty: true,
											shouldTouch: true
										});
										close();
									}}
								>
									Link as requirement
								</TextButton>
								<TextButton
									icon={Replace}
									onClick={() => {
										swapTalents(i, selected);
										close();
									}}
								>
									Swap with selected
								</TextButton>
							</>
						)}
						<TextButton
							icon={Pointer}
							onClick={() => {
								setSelected(i);
								close();
							}}
						>
							Select
						</TextButton>
					</>
				)
			}
		>
			<SpellIcon
				ref={ref}
				onClick={e => {
					if (e.shiftKey && editable && selected !== -1) {
						setValue(
							`talents.${selected}.requires`,
							selected === i ? null : i,
							{
								shouldDirty: true,
								shouldTouch: true
							}
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
					if (!editable || isEmpty) {
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
					swapTalents(i, idx);
				}}
				showDefault={!isEmpty}
			/>
		</Tooltip>
	);
};
export default TalentPreview;
