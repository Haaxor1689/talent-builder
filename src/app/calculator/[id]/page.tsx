import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import TalentCalculator from '#components/calculator/TalentCalculator.tsx';
import { env } from '#env.js';
import { getSavedBuild } from '#server/api/savedBuilds.ts';
import { getTalentTree } from '#server/api/talentTree.ts';
import { CalculatorParams } from '#server/schemas.ts';
import { getIconPath, invoke, maskToClass } from '#utils/index.ts';

type Props = PageProps<'/calculator/[id]'>;

export const generateMetadata = async ({
	params
}: Props): Promise<Metadata> => {
	const { id } = await params;
	const savedBuild = await invoke(getSavedBuild({ id }));
	if (!savedBuild) return {};
	const cls = maskToClass(savedBuild.class);
	return {
		title: `${savedBuild.name || cls?.name}`,
		description: `Talent tree created by ${savedBuild.createdBy?.name}`,
		icons: [{ rel: 'icon', url: getIconPath(cls?.icon, env.DEPLOY_URL) }]
	};
};

const Page = async ({ params, searchParams }: Props) => {
	const { id } = await params;
	const parsed = CalculatorParams.safeParse(await searchParams);
	if (!parsed.success) return notFound();

	if (!id || id === 'undefined') return notFound();
	const savedBuild = await invoke(getSavedBuild({ id }));
	if (!savedBuild) return notFound();

	const trees = await Promise.all([
		invoke(getTalentTree({ slugOrId: parsed.data.t0 ?? savedBuild.tree0Id })),
		invoke(getTalentTree({ slugOrId: parsed.data.t1 ?? savedBuild.tree1Id })),
		invoke(getTalentTree({ slugOrId: parsed.data.t2 ?? savedBuild.tree2Id }))
	] as const);

	return <TalentCalculator trees={trees} values={savedBuild} />;
};

export default Page;
