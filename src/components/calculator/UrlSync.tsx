'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';

import { BuildForm } from '#server/schemas.ts';

import { bitPack } from './utils';

const UrlSync = ({ values }: { values?: Partial<BuildForm> }) => {
	const searchParams = useSearchParams();

	// Update points in URL
	const points = useWatch<BuildForm, 'points'>({ name: 'points' });
	const cls = useWatch<BuildForm, 'class'>({ name: 'class' });
	const rows = useWatch<BuildForm, 'rows'>({ name: 'rows' });

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
		params.delete('rows');

		if (cls !== defaults.class) {
			params.append('class', cls.toString());
		}

		const t = bitPack(points);
		if (t !== bitPack(defaults.points)) {
			params.append('points', t);
		}

		if (rows !== defaults.rows) {
			params.append('rows', rows.toString());
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
		// oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
	}, [points, cls, rows, values]);

	return null;
};

export default UrlSync;
