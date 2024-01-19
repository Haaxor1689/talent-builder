import Link from 'next/link';

import { api } from '~/trpc/server';

import TalentIcon from './_components/TalentIcon';

const PublicTrees = async () => {
	const listPublic = await api.talentTree.listPublic.query();

	if (!listPublic.length) return null;

	return (
		<div className="flex flex-col gap-3">
			<h3 className="tw-color">Public</h3>
			<div className="tw-surface flex flex-wrap justify-center gap-3">
				{listPublic.map(s => (
					<div key={s.id} className="flex w-[100px] flex-col rounded py-3">
						<Link href={`/${s.id}`} className="mx-auto">
							<TalentIcon icon={s.icon} showDefault clickable />
						</Link>
						<p className="truncate text-center">{s.name}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default PublicTrees;
