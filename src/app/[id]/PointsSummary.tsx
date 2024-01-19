'use client';

import { useWatch } from 'react-hook-form';

import { type TalentFormT } from '~/server/api/types';

const PointsSummary = () => {
	const field = useWatch<TalentFormT, 'tree'>({ name: 'tree' });
	// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
	const pointCount = field.reduce((p, n) => p + (n?.ranks || 0), 0);
	return (
		<p>
			Total points: <span>{pointCount}</span>
		</p>
	);
};

export default PointsSummary;
