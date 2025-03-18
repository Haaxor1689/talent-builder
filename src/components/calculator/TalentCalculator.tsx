'use client';

import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useMemo } from 'react';
import cls from 'classnames';

import {
	BuildForm,
	type BuildFormT,
	type TalentFormT
} from '~/server/api/types';
import { zodResolver } from '~/utils';

import ClassPicker from '../form/ClassPicker';

import TalentSpec from './TalentSpec';
import UrlSync from './UrlSync';
import Actions from './Actionts';
import TreePickDialogProvider from './TreePickDialog';
import ClassCalculatorsLinks from './ClassCalculatorsLinks';

const PointsSpent = () => {
	const points = useWatch<BuildFormT, 'points'>({ name: 'points' });
	const sums = points.map(p => p.reduce((acc, curr) => acc + curr, 0));
	const reqLvl = sums.reduce((acc, curr) => acc + curr, 0);
	const pointsLeft = 51 - reqLvl;
	return (
		<div className="flex flex-wrap justify-between md:contents">
			<span className="h3 grow">{sums.join(' / ')}</span>
			{!!reqLvl && (
				<span className="h4 text-blueGray">
					Level: <span className="h3">{reqLvl + 9}</span>
				</span>
			)}
			{!!pointsLeft && (
				<span className="h4 text-blueGray">
					Points left: <span className="h3">{pointsLeft}</span>
				</span>
			)}
		</div>
	);
};

type Props = {
	urlBase?: string;
	defaultValues?: Partial<BuildFormT>;
	trees: [TalentFormT?, TalentFormT?, TalentFormT?];
	isNew?: boolean;
};

const TalentCalculator = ({ urlBase, trees, isNew, ...props }: Props) => {
	const defaultValues = useMemo(
		() => BuildForm.parse(props.defaultValues ?? {}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	const formProps = useForm({
		defaultValues,
		resolver: zodResolver(BuildForm)
	});

	return (
		<FormProvider {...formProps}>
			{urlBase && <ClassCalculatorsLinks urlBase={urlBase} />}
			<TreePickDialogProvider>
				<form className="tw-surface flex flex-col gap-3">
					<div className="flex flex-col gap-3 md:flex-row md:items-center">
						<div className="flex grow flex-col gap-4 md:flex-row md:items-center">
							<ClassPicker
								name="class"
								title={defaultValues.name}
								large
								showEmpty
							/>
							<PointsSpent />
							<UrlSync defaultValues={defaultValues} isNew={!!isNew} />
						</div>

						<div className="flex items-center" />
					</div>

					<hr />

					<div className="-m-2 mt-0 grid grid-cols-1 items-center justify-center gap-2 lg:grid-cols-3">
						<TalentSpec idx={0} value={trees[0]} />
						<TalentSpec idx={1} value={trees[1]} />
						<TalentSpec idx={2} value={trees[2]} />
					</div>

					<Actions trees={trees} isNew={isNew} />
				</form>
			</TreePickDialogProvider>
		</FormProvider>
	);
};

export default TalentCalculator;
