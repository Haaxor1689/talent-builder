'use client';

import { useWatch } from 'react-hook-form';

import { type TalentFormT } from '~/server/api/types';

const PointsSummary = () => {
	const field = useWatch<TalentFormT, 'tree'>({ name: 'tree' });
	return (
		<p>
			Total points:{' '}
			<span>{field.reduce((p, n) => p + ((n?.ranks ?? 0) || 0), 0)}</span>
		</p>
	);
};

export default PointsSummary;
