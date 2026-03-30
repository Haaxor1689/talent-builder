'use client';

import { useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';

import VersionPicker from '#components/form/VersionPicker.tsx';
import {
	BuildForm,
	CalculatorParams,
	type TalentForm
} from '#server/schemas.ts';
import { zodResolver } from '#utils/index.ts';

import ClassPicker from '../form/ClassPicker';
import ScrollArea from '../styled/ScrollArea';
import Actions from './Actions';
import ClassCalculatorsLinks from './ClassCalculatorsLinks';
import TalentSpec from './TalentSpec';
import UrlSync from './UrlSync';

const PointsSpent = () => {
	const points = useWatch<BuildForm, 'points'>({ name: 'points' });
	const rows = useWatch<BuildForm, 'rows'>({ name: 'rows' });
	const sums = points.map(p => p.reduce((acc, curr) => acc + curr, 0));
	const reqLvl = sums.reduce((acc, curr) => acc + curr, 0);
	const pointsLeft = rows * 5 + 16 - reqLvl;
	return (
		<>
			<span className="grow h3">{sums.join(' / ')}</span>
			<div className="flex gap-3">
				{!!reqLvl && (
					<span className="h4 text-blue-gray">
						Level: <span className="h3">{reqLvl + 9}</span>
					</span>
				)}
				{!!pointsLeft && (
					<span className="h4 text-blue-gray">
						Points left: <span className="h3">{pointsLeft}</span>
					</span>
				)}
			</div>
		</>
	);
};

type Props = {
	urlBase?: string;
	values?: Partial<BuildForm>;
	trees: [TalentForm?, TalentForm?, TalentForm?];
	isNew?: boolean;
};

const TalentCalculator = ({ urlBase, trees, isNew, values }: Props) => {
	const searchParams = useSearchParams();
	const defaultValues = useMemo(() => {
		const search = CalculatorParams.safeParse(
			Object.fromEntries(searchParams.entries())
		);
		const data = search.success ? search.data : CalculatorParams.parse({});
		const p = BuildForm.safeParse({
			...values,
			class: data.class ?? values?.class,
			points: data.points ?? values?.points,
			rows: data.rows ?? values?.rows
		});
		return p.success ? p.data : BuildForm.parse({});
	}, [values, searchParams]);

	const formProps = useForm({
		defaultValues,
		resolver: zodResolver(BuildForm)
	});

	return (
		<FormProvider {...formProps}>
			<UrlSync values={values} />
			{urlBase && <ClassCalculatorsLinks urlBase={urlBase} />}
			<form className="haax-surface-3">
				<div className="flex grow flex-wrap items-center gap-3">
					<ClassPicker
						name="class"
						title={defaultValues.name}
						large
						disabled={values?.class !== undefined}
					/>
					<PointsSpent />
					<VersionPicker
						name="rows"
						disabled={values?.rows !== undefined}
						required
					/>
				</div>

				<hr />

				<ScrollArea
					containerClassName="-m-3"
					contentClassName="grid grid-cols-[repeat(3,minmax(min-content,1fr))]"
				>
					{([0, 1, 2] as const).map(i => (
						<TalentSpec
							key={i}
							idx={i}
							tree={trees[i]}
							canChangeTree={!urlBase}
						/>
					))}
				</ScrollArea>

				<Actions trees={trees} isNew={isNew} />
			</form>
		</FormProvider>
	);
};

export default TalentCalculator;
