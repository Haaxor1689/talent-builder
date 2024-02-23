import { notFound } from 'next/navigation';

import { getTalentTree } from '~/server/api/routers/talentTree';
import { CalculatorParams, type CalculatorParamsT } from '~/server/api/types';
import { maskToClass } from '~/utils';
import { env } from '~/env';

import TalentCalculator from '../_components/calculator/TalentCalculator';

type PageProps = {
	searchParams: CalculatorParamsT;
};

export const generateMetadata = async ({ searchParams }: PageProps) => {
	const parsed = CalculatorParams.safeParse(searchParams);
	if (!parsed.success) return null;

	const trees = await Promise.all([
		getTalentTree(parsed.data.t0),
		getTalentTree(parsed.data.t1),
		getTalentTree(parsed.data.t2)
	] as const);

	const classInfo = maskToClass(parsed.data.c);
	const className = classInfo ? `${classInfo.name} ` : '';
	return {
		title: `${className}Talent Calculator | Talent Builder`,
		description: `Custom ${className}talent tree calculator consisting of trees: ${trees
			.map(t => t?.name)
			.join(', ')}`,
		icons: [
			{
				rel: 'icon',
				url: `${env.DEPLOY_URL}/api/icon/${
					classInfo?.icon ?? 'inv_misc_questionmark'
				}`
			}
		]
	};
};

const TalentCalculatorPage = async ({ searchParams }: PageProps) => {
	const parsed = CalculatorParams.safeParse(searchParams);
	if (!parsed.success) return notFound();

	const trees = await Promise.all([
		getTalentTree(parsed.data.t0),
		getTalentTree(parsed.data.t1),
		getTalentTree(parsed.data.t2)
	] as const);

	const points = parsed.data.t?.split('-').map(t => [...t].map(Number));
	return (
		<TalentCalculator
			trees={trees}
			cls={parsed.data.c}
			points={points as never}
		/>
	);
};

export default TalentCalculatorPage;
