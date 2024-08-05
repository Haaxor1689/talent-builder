import { listProposalTalentTrees } from '~/server/api/routers/talentTree';
import { type FiltersT } from '~/server/api/types';

import NoResults from '../NoResults';

import TalentTreeGrid from './TalentTreeGrid';

const ProposalTrees = async (props: FiltersT) => {
	const list = await listProposalTalentTrees(props).catch(() => []);

	if (!list.length) return <NoResults />;

	return (
		<TalentTreeGrid
			list={list.map(s => ({
				href: `/tree/${s.id}`,
				...s
			}))}
		/>
	);
};

export default ProposalTrees;
