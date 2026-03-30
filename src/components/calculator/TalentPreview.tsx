'use client';

import cls from 'classnames';
import { Minus, Plus } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';

import { TalentDescription } from '#components/styled/TalentDescription.tsx';
import useIsMobile from '#hooks/useIsMobile.tsx';
import {
	type BuildForm,
	type Talent,
	type TalentForm
} from '#server/schemas.ts';

import SpellIcon from '../styled/SpellIcon';
import TalentArrow from '../styled/TalentArrow';
import TextButton from '../styled/TextButton';
import Tooltip from '../styled/Tooltip';

type Props = {
	i: number;
	idx: 0 | 1 | 2;
	talents: TalentForm['talents'];
};

const TalentPreview = ({ i, idx, talents }: Props) => {
	const isMobile = useIsMobile();

	const { setValue } = useFormContext<BuildForm>();

	const field = talents[i] as Talent;

	const rows = useWatch<BuildForm, 'rows'>({ name: 'rows' });
	const points = useWatch<BuildForm, 'points'>({ name: 'points' });
	const value = points[idx][i] ?? 0;

	const row = Math.floor(i / 4);
	const sums = points.map(p => p.reduce((acc, curr) => acc + curr, 0));
	const pointsLeft = rows * 5 + 16 - sums.reduce((acc, curr) => acc + curr, 0);

	const disabled =
		// Has no points and all points were spent
		(value === 0 && pointsLeft === 0) ||
		// Not enough points spent in the tree to unlock the row
		(sums[idx] ?? 0) < row * 5 ||
		// Has unmet talent requirement
		points[idx][field.requires ?? -1] !== talents[field.requires ?? -1]?.ranks;

	const increment = () => {
		if (disabled || !field.ranks || pointsLeft === 0) return;
		if (value === field.ranks) return;
		setValue(`points.${idx}.${i}`, value + 1);
	};

	const decrement = () => {
		if (disabled || !field.ranks) return;
		if (value === 0) return;

		const requiredBy = Object.entries(talents)
			.map(([idx, t]) => (t?.requires === i ? Number(idx) : undefined))
			.filter(t => t !== undefined);
		// If the talent is required by another, prevent removing points
		if (requiredBy.some(t => points[idx][t])) return;

		// Get current point sum in each row
		const pointsPerRow = [...Array(rows).keys()].map(i =>
			points[idx].slice(i * 4, i * 4 + 4).reduce((acc, curr) => acc + curr, 0)
		);

		// Find the last row that has points spent in it
		const lastActiveRow = pointsPerRow.findLastIndex(total => total > 0);

		// If talent is in the last active row, no need to check further
		if (row !== lastActiveRow) {
			// Calculate how many points can be removed in each row up to the current one
			const canRemovePerRow: number[] = [];
			let extra = 0;
			for (const row of pointsPerRow.slice(0, lastActiveRow)) {
				extra = row + extra - 5;
				canRemovePerRow.push(extra);
			}
			// If none of the above rows have extra points to remove, prevent removing points from the current row
			if (canRemovePerRow.slice(row).some(i => i === 0)) return;
		}

		setValue(`points.${idx}.${i}`, value - 1);
	};

	return (
		<Tooltip
			tooltip={
				<>
					<p className="haax-color h3">{field.name || '[Unnamed talent]'}</p>
					<p className="font-bold">
						Rank {value}/{field.ranks}
					</p>
					<TalentDescription field={field} value={value} />
				</>
			}
			actions={
				!!field.ranks && (
					<div className="flex items-center gap-2 text-xl">
						<TextButton
							icon={<Minus />}
							title="Remove point"
							onClick={decrement}
							className="icon-size-8"
						/>
						{value}/{field.ranks}
						<TextButton
							icon={<Plus />}
							title="Add point"
							onClick={increment}
							className="icon-size-8"
						/>
					</div>
				)
			}
		>
			{props => (
				<SpellIcon
					icon={field.icon}
					currentRank={value}
					ranks={field.ranks}
					onClick={e => {
						e.preventDefault();
						increment();
					}}
					onContextMenu={e => {
						e.preventDefault();
						if (isMobile) return;
						decrement();
					}}
					{...props}
					className={cls({ grayscale: disabled })}
					extraContent={
						field.requires !== null && (
							<TalentArrow
								start={field.requires}
								end={i}
								highlighted={!disabled}
							/>
						)
					}
				/>
			)}
		</Tooltip>
	);
};
export default TalentPreview;
