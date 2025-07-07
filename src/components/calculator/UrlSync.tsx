'use client';

import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';

import { BuildForm, type BuildFormT } from '~/server/api/types';

import { bitPack } from './utils';

const UrlSync = ({ values }: { values?: Partial<BuildFormT> }) => {
	const searchParams = useSearchParams();

	// Update points in URL
	const points = useWatch<BuildFormT, 'points'>({ name: 'points' });
	const cls = useWatch<BuildFormT, 'class'>({ name: 'class' });

	useEffect(() => {
		const params = new URLSearchParams(
			Object.fromEntries(searchParams.entries())
		);

		const defaults = BuildForm.parse(values ?? {});

		// Remove old points and class params
		params.delete('c');
		params.delete('t');
		params.delete('class');
		params.delete('points');

		if (cls !== defaults.class) {
			params.append('class', cls.toString());
		}

		const t = bitPack(points);
		if (t !== bitPack(defaults.points)) {
			params.append('points', t);
		}

		window.history.replaceState(
			null,
			'',
			[
				location.origin,
				location.pathname,
				params.toString() === '' ? '' : `?${params.toString()}`
			].join('')
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [points, cls, values]);

	return null;
};

export default UrlSync;
