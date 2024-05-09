'use client';

import { useMemo, useRef } from 'react';
import { useWatch, useFormContext } from 'react-hook-form';
import cls from 'classnames';
import { cloneDeep } from 'lodash-es';
import { Link2, Pointer } from 'lucide-react';

import { EmptyTalent, type TalentFormT } from '~/server/api/types';
import { isEmptyTalent } from '~/utils';

import TalentIcon from '../styled/TalentIcon';
import Tooltip from '../styled/Tooltip';
import TextButton from '../styled/TextButton';

type Props = {
	i: number;
	selected: number;
	setSelected: (i: number) => void;
	editable?: boolean;
};

const TalentPreview = ({ i, selected, setSelected, editable }: Props) => {
	const field = useWatch<TalentFormT, `tree.${number}`>({
		name: `tree.${i}`
	});
	const { setValue, getValues } = useFormContext<TalentFormT>();

	const ref = useRef<HTMLButtonElement>(null);
	const dragging = useRef(false);

	const isEmpty = isEmptyTalent(field);

	const description = useMemo(() => {
		if (!field.description) return null;
		if (!field.ranks || field.ranks <= 1) return field.description;

		const reg = new RegExp(
			`([\\d\\.]*(?:\\/[\\d\\.]*\\d){${field.ranks - 1},})`,
			'gm'
		);
		const result: (string | JSX.Element)[] = [];

		const arr = [...field.description.matchAll(reg)];

		arr.map((match, i) => {
			if (i === 0) result.push(field.description.slice(0, match.index));

			const ranks = match[0].split('/');
			if (ranks.length !== field.ranks) {
				result.push(match[0]);
			} else {
				result.push(
					<span key={i} className="text-blueGray">
						[{ranks.join('/')}]
					</span>
				);
			}

			if (i < arr.length - 1) {
				if (!arr[i + 1]?.index) throw new Error('Unexpected end of match');
				result.push(
					field.description.slice(
						match.index + match[0].length,
						arr[i + 1]?.index
					)
				);
			} else {
				result.push(field.description.slice(match.index + match[0].length));
			}
		});

		if (result.length === 0) return field.description;

		return result;
	}, [field.description, field.ranks]);

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
							<TextButton
								icon={Link2}
								onClick={() => {
									setValue(`tree.${selected}.requires`, i, {
										shouldDirty: true,
										shouldTouch: true
									});
									close();
								}}
							>
								Link as requirement
							</TextButton>
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
			<TalentIcon
				ref={ref}
				onClick={e => {
					if (e.shiftKey && editable && selected !== -1) {
						setValue(`tree.${selected}.requires`, selected === i ? null : i, {
							shouldDirty: true,
							shouldTouch: true
						});
					} else {
						setSelected(selected === i ? -1 : i);
					}
				}}
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
				showDefault={!isEmpty}
			/>
		</Tooltip>
	);
};
export default TalentPreview;
