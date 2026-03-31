'use client';

import { useWatch } from 'react-hook-form';

import { type TalentForm } from '#server/schemas.ts';
import { getTalentSum } from '#utils/index.ts';

const PointsSummary = () => {
	const field = useWatch<TalentForm, 'talents'>({ name: 'talents' });
	const rows = useWatch<TalentForm, 'rows'>({ name: 'rows' });
	return (
		<p className="absolute right-3 bottom-3 text-blue-gray">
			Points: <span>{getTalentSum(field, rows)}</span>
		</p>
	);
};

export default PointsSummary;
