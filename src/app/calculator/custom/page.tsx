import { notFound } from 'next/navigation';

import { getTalentTree } from '~/server/api/routers/talentTree';
import { CalculatorParams, type CalculatorParamsT } from '~/server/api/types';
import { getIconPath, maskToClass } from '~/utils';
import TalentCalculator from '~/components/calculator/TalentCalculator';
import { env } from '~/env';

export const dynamic = 'force-dynamic';

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
		icons: [{ rel: 'icon', url: env.DEPLOY_URL + getIconPath(classInfo?.icon) }]
	};
};

const Page = async ({ searchParams }: PageProps) => {
	const parsed = CalculatorParams.safeParse(searchParams);
	if (!parsed.success) return notFound();

	const trees = await Promise.all([
		getTalentTree(parsed.data.t0),
		getTalentTree(parsed.data.t1),
		getTalentTree(parsed.data.t2)
	] as const);

	return (
		<TalentCalculator
			trees={trees}
			defaultValues={{
				...(parsed.data.c !== undefined ? { class: parsed.data.c } : {}),
				...(parsed.data.t !== undefined
					? {
							points: parsed.data.t
								?.split('-')
								.map(t => [...t].map(Number)) as never
					  }
					: {})
			}}
			isNew
		/>
	);
};

export default Page;
