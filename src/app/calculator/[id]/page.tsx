import { notFound } from 'next/navigation';

import { env } from '~/env';
import { getSavedBuild } from '~/server/api/routers/savedBuilds';
import { maskToClass } from '~/utils';
import TalentCalculator from '~/components/calculator/TalentCalculator';
import { getTalentTree } from '~/server/api/routers/talentTree';
import { CalculatorParams, type CalculatorParamsT } from '~/server/api/types';

export const dynamic = 'force-dynamic';

export type PageProps = {
	params: { id: string };
	searchParams: CalculatorParamsT;
};

export const generateMetadata = async ({ params }: PageProps) => {
	const savedBuild = await getSavedBuild(params.id);
	if (!savedBuild) return null;
	const cls = maskToClass(savedBuild.class);
	return {
		title: `${savedBuild.name || cls?.name} | Talent Calculator`,
		description: `Talent tree created by ${savedBuild.createdBy.name}`,
		icons: [
			{
				rel: 'icon',
				url: `${env.DEPLOY_URL}/api/icon/${cls?.icon}`
			}
		]
	};
};

const Page = async ({ params, searchParams }: PageProps) => {
	const parsed = CalculatorParams.safeParse(searchParams);
	if (!parsed.success) return notFound();

	if (!params.id || params.id === 'undefined') return notFound();
	const savedBuild = await getSavedBuild(params.id);
	if (!savedBuild) return notFound();

	const trees = await Promise.all([
		getTalentTree(parsed.data.t0 ?? savedBuild.tree0Id),
		getTalentTree(parsed.data.t1 ?? savedBuild.tree1Id),
		getTalentTree(parsed.data.t2 ?? savedBuild.tree2Id)
	] as const);

	return (
		<TalentCalculator
			defaultValues={{
				...savedBuild,
				...(parsed.data.c !== undefined ? { class: parsed.data.c } : {}),
				...(parsed.data.t !== undefined
					? {
							points: parsed.data.t
								?.split('-')
								.map(t => [...t].map(Number)) as never
					  }
					: {})
			}}
			trees={trees}
		/>
	);
};

export default Page;
