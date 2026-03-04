import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import TalentCalculator from '#components/calculator/TalentCalculator.tsx';
import { env } from '#env.js';
import { getTalentTree } from '#server/api/routers/talentTree.ts';
import { CalculatorParams } from '#server/schemas.ts';
import { getIconPath, maskToClass } from '#utils.ts';

type Props = PageProps<'/calculator'>;

export const generateMetadata = async ({
	searchParams
}: Props): Promise<Metadata> => {
	const parsed = CalculatorParams.safeParse(await searchParams);
	if (!parsed.success) return {};

	const trees = await Promise.all([
		getTalentTree(parsed.data.t0),
		getTalentTree(parsed.data.t1),
		getTalentTree(parsed.data.t2)
	] as const);

	const classInfo = maskToClass(parsed.data.class);
	const className = classInfo ? `${classInfo.name} ` : '';
	return {
		title: `${className}Talent Calculator | Talent Builder`,
		description: `Custom ${className}talent tree calculator consisting of trees: ${trees
			.map(t => t?.name)
			.join(', ')}`,
		icons: [{ rel: 'icon', url: env.DEPLOY_URL + getIconPath(classInfo?.icon) }]
	};
};

const Page = async ({ searchParams }: Props) => {
	const parsed = CalculatorParams.safeParse(await searchParams);
	if (!parsed.success) return notFound();

	const trees = await Promise.all([
		getTalentTree(parsed.data.t0),
		getTalentTree(parsed.data.t1),
		getTalentTree(parsed.data.t2)
	] as const);

	return (
		<>
			<h2 className="haax-color mt-4 -mb-2 text-center">Talent Calculator</h2>
			<TalentCalculator trees={trees} isNew />
		</>
	);
};

export default Page;
