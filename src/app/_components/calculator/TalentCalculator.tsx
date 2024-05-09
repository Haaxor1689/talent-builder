'use client';

import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import cls from 'classnames';

import {
	type TalentFormT,
	EmptyCalculatorForm,
	CalculatorForm,
	type CalculatorFormT
} from '../../../server/api/types';
import { zodResolver } from '../../../utils';
import ClassPicker from '../form/ClassPicker';

import TalentSpec from './TalentSpec';

const PointsSpent = () => {
	const points = useWatch<CalculatorFormT, 'points'>({ name: 'points' });
	const sums = points.map(p => p.reduce((acc, curr) => acc + curr, 0));
	const pointsLeft = 51 - sums.reduce((acc, curr) => acc + curr, 0);
	return (
		<div className="flex flex-wrap justify-between md:contents">
			<span className="h3 grow">{sums.join(' / ')}</span>
			<span className="h4 text-blueGray">
				Points left:{' '}
				<span className={cls('h3', { 'text-blueGray': !pointsLeft })}>
					{pointsLeft}
				</span>
			</span>
		</div>
	);
};

const UrlSync = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const points = useWatch<CalculatorFormT, 'points'>({ name: 'points' });
	useEffect(() => {
		const t = points.map(p => p.join('')).join('-');
		const newUrl = `${pathname}?${new URLSearchParams({
			...Object.fromEntries(searchParams.entries()),
			t
		}).toString()}`;
		window.history.replaceState(
			{ ...window.history.state, as: newUrl, url: newUrl },
			'',
			newUrl
		);
	}, [points, searchParams, pathname, router]);

	const cls = useWatch<CalculatorFormT, 'class'>({ name: 'class' });
	useEffect(() => {
		if (searchParams.get('c') === cls.toString()) return;
		const newUrl = `${pathname}?${new URLSearchParams({
			...Object.fromEntries(searchParams.entries()),
			c: cls.toString()
		}).toString()}`;
		router.replace(newUrl);
	}, [cls, searchParams, pathname, router]);

	return null;
};

type Props = {
	trees: [TalentFormT?, TalentFormT?, TalentFormT?];
	points?: [number[], number[], number[]];
	cls: number;
};

const TalentCalculator = ({ trees, cls, points }: Props) => {
	const defaultValues = useMemo(
		() => EmptyCalculatorForm({ class: cls, points }),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	const formProps = useForm({
		defaultValues,
		resolver: zodResolver(CalculatorForm)
	});

	return (
		<FormProvider {...formProps}>
			<form className="tw-surface flex flex-col gap-3">
				<div className="flex flex-col gap-3 md:flex-row md:items-center">
					<div className="flex grow flex-col gap-4 md:flex-row md:items-center">
						<ClassPicker name="class" large showEmpty />
						<PointsSpent />
						<UrlSync />
					</div>

					<div className="flex items-center" />
				</div>

				<hr />

				<div className="-m-2 mt-0 grid grid-cols-1 items-center justify-center gap-2 lg:grid-cols-3">
					<TalentSpec idx={0} value={trees[0]} />
					<TalentSpec idx={1} value={trees[1]} />
					<TalentSpec idx={2} value={trees[2]} />
				</div>
			</form>
		</FormProvider>
	);
};

export default TalentCalculator;
