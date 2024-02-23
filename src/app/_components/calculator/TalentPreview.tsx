'use client';

import { useMemo, useRef } from 'react';
import cls from 'classnames';
import { useFormContext, useWatch } from 'react-hook-form';

import { type CalculatorFormT, type TalentFormT } from '~/server/api/types';

import useTooltip from '../hooks/useTooltip';
import TalentIcon from '../styled/TalentIcon';

type Props = TalentFormT['tree'][number] & {
	i: number;
	idx: 0 | 1 | 2;
	tree: TalentFormT['tree'];
};

const TalentPreview = ({ i, idx, tree, ...field }: Props) => {
	const ref = useRef<HTMLButtonElement>(null);

	const { tooltipProps, elementProps } = useTooltip();

	const { setValue } = useFormContext<CalculatorFormT>();

	const value = useWatch<CalculatorFormT, `points.${0 | 1 | 2}.${number}`>({
		name: `points.${idx}.${i}`
	});

	const points = useWatch<CalculatorFormT, `points`>({ name: 'points' });

	const { disabled, cantSubtract, noPointsLeft } = useMemo(() => {
		const sum = points[idx].reduce((acc, curr) => acc + curr, 0);

		const row = Math.floor(i / 4);

		const noPointsLeft =
			points.flatMap(p => p).reduce((acc, curr) => acc + curr, 0) === 51;

		const missingRowPoints = sum < row * 5;

		const requiredTalent = tree[field.requires ?? -1];
		const notMetRequirement =
			requiredTalent &&
			points[idx][field.requires ?? -1] !== requiredTalent.ranks;

		const disabled =
			(value === 0 && noPointsLeft) || missingRowPoints || notMetRequirement;

		const requiredByTalents = tree
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

	return (
		<>
			<TalentIcon
				ref={ref}
				icon={field.icon}
				value={value}
				ranks={noPointsLeft && value === 0 ? undefined : field.ranks}
				clickable={!disabled}
				onMouseDown={
					!disabled
						? e => {
								e.preventDefault();
								if (cantSubtract && e.button !== 0) return;
								if (noPointsLeft && e.button === 0) return;
								const newValue = e.button === 0 ? value + 1 : value - 1;
								setValue(
									`points.${idx}.${i}`,
									Math.max(Math.min(newValue, field.ranks ?? 1), 0)
								);
						  }
						: undefined
				}
				onContextMenu={e => e.preventDefault()}
				arrow={
					!field.requires && field.requires !== 0
						? undefined
						: [field.requires, i]
				}
				highlightedArrow={!disabled}
				className={cls({ grayscale: disabled })}
				{...elementProps}
			/>
			<div
				className="tw-surface max-w-[400px] bg-darkerGray/90"
				{...tooltipProps}
			>
				{/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
				<h4 className="tw-color">{field.name || '[Unnamed talent]'}</h4>
				{/* eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing */}
				<p>{field.description || '[No description]'}</p>
			</div>
		</>
	);
};
export default TalentPreview;
