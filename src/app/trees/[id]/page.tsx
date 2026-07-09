import { type Metadata } from 'next';
import { notFound } from 'next/navigation';

import AdsenseScript from '#components/AdsenseScript.tsx';
import TalentBuilder from '#components/builder/TalentBuilder.tsx';
import { env } from '#env.js';
import { getOgInfo } from '#server/api/openGraph.ts';
import { getTalentTree } from '#server/api/talentTree.ts';
import { getIconPath, invoke } from '#utils/index.ts';
import { isRichTreeContent } from '#utils/isRichContent.ts';

type Props = PageProps<'/trees/[id]'>;

export const generateMetadata = async ({
	params
}: Props): Promise<Metadata> => {
	const { id } = await params;
	const info = await invoke(getOgInfo({ id }));
	if (!info)
		return {
			title: 'Talent Tree Not Found',
			description: 'This talent tree does not exist.',
			robots: { index: false, follow: false }
		};
	const authorName = info.createdBy.name || 'unknown creator';
	return {
		title: info.name,
		description: `Talent tree created by ${authorName}`,
		icons: [{ rel: 'icon', url: getIconPath(info.icon, env.DEPLOY_URL) }]
	};
};

const Page = async ({ params }: Props) => {
	const { id } = await params;
	const talentTree = await invoke(getTalentTree({ slugOrId: id }));
	if (!talentTree) return notFound();

	const canShowAds = isRichTreeContent({
		notes: talentTree.notes,
		talents: talentTree.talents
	});

	return (
		<>
			<TalentBuilder defaultValues={talentTree} />
			{canShowAds && <AdsenseScript />}
		</>
	);
};

export default Page;
