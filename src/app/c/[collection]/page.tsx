import { notFound } from 'next/navigation';
import { z } from 'zod';

import ClassCalculatorsLinks from '~/components/calculator/ClassCalculatorsLinks';
import NoResults from '~/components/NoResults';
import TalentTreeGrid from '~/components/tree-lists/TalentTreeGrid';
import { listPublicTalentTrees } from '~/server/api/routers/talentTree';
import { Filters, type FiltersT } from '~/server/api/types';

const ParamsSchema = z.object({
	collection: z.string()
});

export const generateMetadata = async ({ params }: PageProps) => {
	const parsed = ParamsSchema.safeParse(params);
	if (!parsed.success) return notFound();
	return {
		title: `${parsed.data.collection} collection | Talent Builder`,
		description: 'Collection of talents'
	};
};

type PageProps = {
	params: z.infer<typeof ParamsSchema>;
	searchParams: FiltersT;
};

const TalentTreePage = async ({ params, searchParams }: PageProps) => {
	const parsed = ParamsSchema.safeParse(params);
	if (!parsed.success) return notFound();

	const search = Filters.safeParse(searchParams);
	if (!search.success) notFound();

	const list = await listPublicTalentTrees({
		...search.data,
		sort: 'class',
		collection: parsed.data.collection
	});

	if (!list.length) return <NoResults />;

	return (
		<div className="flex flex-col gap-3">
			<div className="tw-surface">
				<h3 className="tw-color">
					{parsed.data.collection.replaceAll('-', ' ')}
				</h3>
			</div>

			<h4>Class talent calculators:</h4>
			<ClassCalculatorsLinks urlBase={`/c/${parsed.data.collection}/`} />

			<h4>Talent tree builders:</h4>
			<TalentTreeGrid
				list={list.map(s => ({
					href: `/tree/${s.id}`,
					...s
				}))}
				className="md:px-12"
			/>
		</div>
	);
};

export default TalentTreePage;
