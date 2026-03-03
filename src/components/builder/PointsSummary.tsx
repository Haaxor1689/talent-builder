'use client';

import { useWatch } from 'react-hook-form';

import { type TalentFormT } from '#server/api/types.ts';
import { getTalentSum } from '#utils.ts';

const PointsSummary = () => {
	const field = useWatch<TalentFormT, 'talents'>({ name: 'talents' });
	return (
		<p className="text-blue-gray absolute right-3 bottom-3">
			Points: <span>{getTalentSum(field)}</span>
		</p>
	);
};

export default PointsSummary;
