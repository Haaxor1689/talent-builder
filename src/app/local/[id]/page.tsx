'use client';

import { notFound } from 'next/navigation';

import TalentBuilder from '~/app/_components/builder/TalentBuilder';
import useLocalStorage from '~/app/_components/hooks/useLocalStorage';
import Spinner from '~/app/_components/styled/Spinner';
import { type TalentFormT } from '~/server/api/types';

const LocalTreePage = ({ params }: { params: { id: string } }) => {
	const [savedSpecs, _1, specsLoading] =
		useLocalStorage<Record<string, TalentFormT>>('saved-specs');

	if (specsLoading)
		return (
			<div className="flex grow items-center justify-center">
				<Spinner />
			</div>
		);

	const localSpec = savedSpecs?.[params.id];
	if (!localSpec) return notFound();
	return <TalentBuilder defaultValues={localSpec} isLocal />;
};

export default LocalTreePage;
