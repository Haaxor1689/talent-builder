import { useCallback, useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { usePathname, useSearchParams } from 'next/navigation';

import { EmptySavedBuild, type BuildFormT } from '~/server/api/types';

const UrlSync = ({
	defaultValues,
	isNew
}: {
	defaultValues: BuildFormT;
	isNew: boolean;
}) => {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const replaceUrl = useCallback(
		(key: string, condition: boolean, value: string) => {
			const params = new URLSearchParams(
				Object.fromEntries(searchParams.entries())
			);
			params.delete(key);
			if (condition) params.append(key, value);

			const newUrl = `${pathname}?${params.toString()}`;
			window.history.replaceState(
				{ ...window.history.state, as: newUrl, url: newUrl },
				'',
				newUrl
			);
		},
		[pathname, searchParams]
	);

	const points = useWatch<BuildFormT, 'points'>({ name: 'points' });
	useEffect(() => {
		const serializePoints = (points: number[][]) =>
			points.map(p => p.join('')).join('-');

		const t = serializePoints(points);
		const defaultPoints = serializePoints(
			defaultValues?.points ?? EmptySavedBuild().points
		);

		replaceUrl('t', isNew || t !== defaultPoints, t);
	}, [points, isNew, defaultValues?.points, replaceUrl]);

	const cls = useWatch<BuildFormT, 'class'>({ name: 'class' });
	useEffect(() => {
		replaceUrl('c', isNew || cls !== defaultValues?.class, cls.toString());
	}, [cls, isNew, defaultValues?.class, replaceUrl]);

	return null;
};

export default UrlSync;
