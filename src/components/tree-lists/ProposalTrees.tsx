import { listProposalTalentTrees } from '~/server/api/routers/talentTree';
import { type FiltersT } from '~/server/api/types';

import TalentTreeGrid from './TalentTreeGrid';

const ProposalTrees = async (props: FiltersT) => {
	const list = await listProposalTalentTrees(props);

	if (!list.length) return null;

	return (
		<TalentTreeGrid
			title="Proposals"
			list={list.map(s => ({
				href: `/tree/${s.id}`,
				...s
			}))}
		/>
	);
};

export default ProposalTrees;
