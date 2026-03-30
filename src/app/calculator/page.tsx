import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import TalentCalculator from '#components/calculator/TalentCalculator.tsx';
import PageTitle from '#components/layout/PageTitle.tsx';
import { env } from '#env.js';
import { getTalentTree } from '#server/api/talentTree.ts';
import { CalculatorParams } from '#server/schemas.ts';
import { getIconPath, maskToClass } from '#utils/index.ts';

type Props = PageProps<'/calculator'>;

export const generateMetadata = async ({
	searchParams
}: Props): Promise<Metadata> => {
	const parsed = CalculatorParams.safeParse(await searchParams);
	if (!parsed.success) return {};

	const trees = await Promise.all([
		getTalentTree({ slugOrId: parsed.data.t0 }),
		getTalentTree({ slugOrId: parsed.data.t1 }),
		getTalentTree({ slugOrId: parsed.data.t2 })
	] as const);

	const classInfo = maskToClass(parsed.data.class);
	const className = classInfo ? `${classInfo.name} ` : '';
	return {
		title: `${className} Talent Calculator`,
		description: `Custom ${className} talent tree calculator consisting of trees: ${trees
			.map(t => t?.name)
			.join(', ')}`,
		icons: [{ rel: 'icon', url: getIconPath(classInfo?.icon, env.DEPLOY_URL) }]
	};
};

const Page = async ({ searchParams }: Props) => {
	const parsed = CalculatorParams.safeParse(await searchParams);
	if (!parsed.success) return notFound();

	const trees = await Promise.all([
		getTalentTree({ slugOrId: parsed.data.t0 }),
		getTalentTree({ slugOrId: parsed.data.t1 }),
		getTalentTree({ slugOrId: parsed.data.t2 })
	] as const);

	return (
		<>
			<PageTitle title="Talent Calculator" />
			<TalentCalculator trees={trees} isNew />
		</>
	);
};

export default Page;
