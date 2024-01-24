'use client';

import { useWatch } from 'react-hook-form';

import { type TalentFormT } from '~/server/api/types';
import { getTalentSum } from '~/utils';

const PointsSummary = () => {
	const field = useWatch<TalentFormT, 'tree'>({ name: 'tree' });
	return (
		<p className="absolute bottom-0 right-0 text-blueGray">
			Points: <span>{getTalentSum(field)}</span>
		</p>
	);
};

export default PointsSummary;
