'use client';

import dedent from 'dedent';
import { BookOpenText } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import VersionPicker from '#components/form/VersionPicker.tsx';
import CollapsibleSection from '#components/styled/CollapsibleSection.tsx';
import Md from '#components/styled/Md.tsx';
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

const calculatorInstructionsText = dedent`
# Calculator Basics

The calculator is for build planning with existing trees. You can use it to allocate points across up to three trees, compare different distributions, and save your builds for later reference or sharing.

1. **Pick a class:** in top left. This is purely for display and searching purposes and does not affect calculations.
1. **Pick a game version:** in top right. This determines how many points you can spend and it also filters out the available trees to only those that are compatible with the selected version.
1. **Select three trees:** to allocate points into. You can select from all public trees and your private trees (if signed in). You can also change the tree any time, open author's notes or clear the points with the buttons below the tree.

# Point Allocation

You can allocate points by **left-clicking** on the talents in the trees. The calculator will automatically enforce the rules of the talent system, such as prerequisites and minimum points per row.

You can remove points by **right-clicking** on the talents (or clicking minus on mobile). The calculator will also enforce the rules when removing points, to prevent creating invalid builds, so if you can't remove specific point, try removing some deeper points first.

# Saving and Sharing

As you make changes, the calculator will automatically update the URL to reflect your current build. You can copy this URL to share your build with others.

Signed in users can also save build templates. All saved builds are public and can be found in your profile. You can also clone and modify existing builds from other users.
`;

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
			<CollapsibleSection
				title={
					<>
						<BookOpenText /> Instructions
					</>
				}
				storageKey="talent-calculator"
			>
				<Md text={calculatorInstructionsText} />
			</CollapsibleSection>
		</FormProvider>
	);
};

export default TalentCalculator;
