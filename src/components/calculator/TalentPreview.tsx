'use client';

import { Fragment, useMemo, useRef } from 'react';
import cls from 'classnames';
import { useFormContext, useWatch } from 'react-hook-form';
import { Minus, Plus } from 'lucide-react';

import { type BuildFormT, type TalentFormT } from '~/server/api/types';
import useIsMobile from '~/hooks/useIsMobile';

import SpellIcon from '../styled/SpellIcon';
import Tooltip from '../styled/Tooltip';
import TextButton from '../styled/TextButton';

import { formatTalentDescription } from './formatTalentDescription';

type Props = TalentFormT['talents'][number] & {
	i: number;
	idx: 0 | 1 | 2;
	talents: TalentFormT['talents'];
};

const TalentPreview = ({ i, idx, talents, ...field }: Props) => {
	const ref = useRef<HTMLButtonElement>(null);
	const isMobile = useIsMobile();

	const { setValue } = useFormContext<BuildFormT>();

	const value = useWatch<BuildFormT, `points.${0 | 1 | 2}.${number}`>({
		name: `points.${idx}.${i}`
	});

	const points = useWatch<BuildFormT, `points`>({ name: 'points' });

	const { disabled, cantSubtract, noPointsLeft } = useMemo(() => {
		const sum = points[idx].reduce((acc, curr) => acc + curr, 0);

		const row = Math.floor(i / 4);

		const noPointsLeft =
			points.flatMap(p => p).reduce((acc, curr) => acc + curr, 0) === 51;

		const missingRowPoints = sum < row * 5;

		const requiredTalent = talents[field.requires ?? -1];
		const notMetRequirement =
			requiredTalent &&
			points[idx][field.requires ?? -1] !== requiredTalent.ranks;

		const disabled =
			(value === 0 && noPointsLeft) || missingRowPoints || notMetRequirement;

		const requiredByTalents = talents
			.map((t, idx) => ({ idx, requires: t.requires }))
			.filter(t => t.requires === i);
		const disabledByRequiredTalent = requiredByTalents.some(
			t => points[idx][t.idx] !== 0
		);

		const pointsPerRow = [...Array(7).keys()].map(i =>
			points[idx].slice(i * 4, i * 4 + 4).reduce((acc, curr) => acc + curr, 0)
		);

		const lastRow = [...Array(7).keys()]
			.reverse()
			.find(i => (pointsPerRow[i] ?? 0) > 0);

		const canRemovePerRow: number[] = [];
		let extra = 0;
		for (const row of pointsPerRow.slice(0, lastRow)) {
			extra = row + extra - 5;
			canRemovePerRow.push(extra);
		}

		const canSubtract =
			row === lastRow || canRemovePerRow.slice(row).every(i => i > 0);

		const cantSubtract = disabledByRequiredTalent || !canSubtract;

		return { disabled, cantSubtract, noPointsLeft };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [points, value]);

	const description = useMemo(
		() => formatTalentDescription(field, value),
		[field.description, field.ranks, value]
	);

	const setPoints = (diff: number) => {
		if (disabled) return;
		if (diff < 0 && cantSubtract) return;
		if (diff > 0 && noPointsLeft) return;
		setValue(
			`points.${idx}.${i}`,
			Math.max(Math.min(value + diff, field.ranks ?? 1), 0)
		);
	};

	return (
		<Tooltip
			tooltip={
				<>
					{/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
					<h4 className="tw-color">{field.name || '[Unnamed talent]'}</h4>
					<p
						className={cls('whitespace-pre-wrap', {
							['text-blueGray']: !description
						})}
					>
						{description ?? '[No description]'}
					</p>
				</>
			}
			actions={() =>
				!!field.ranks && (
					<div className="flex items-center gap-2 text-xl">
						<TextButton
							icon={Minus}
							title="Remove point"
							onClick={() => setPoints(-1)}
							iconSize={32}
						/>
						{value}/{field.ranks}
						<TextButton
							icon={Plus}
							title="Add point"
							onClick={() => setPoints(1)}
							iconSize={32}
						/>
					</div>
				)
			}
		>
			<SpellIcon
				ref={ref}
				icon={field.icon}
				value={value}
				ranks={noPointsLeft && value === 0 ? undefined : field.ranks}
				clickable={!disabled}
				onClick={e => {
					e.preventDefault();
					setPoints(1);
				}}
				onContextMenu={e => {
					e.preventDefault();
					if (isMobile) return;
					setPoints(-1);
				}}
				arrow={
					!field.requires && field.requires !== 0
						? undefined
						: [field.requires, i]
				}
				highlightedArrow={!disabled}
				className={cls({ grayscale: disabled })}
			/>
		</Tooltip>
	);
};
export default TalentPreview;
