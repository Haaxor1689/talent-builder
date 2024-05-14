'use client';

import { notFound } from 'next/navigation';

import TalentBuilder from '~/components/builder/TalentBuilder';
import useLocalStorage from '~/hooks/useLocalStorage';
import Spinner from '~/components/styled/Spinner';
import { type TalentFormT } from '~/server/api/types';

type PageProps = {
	params: { id: string };
};

const Page = ({ params }: PageProps) => {
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

export default Page;
