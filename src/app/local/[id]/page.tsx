'use client';

import { notFound } from 'next/navigation';

import TalentBuilder from '~/components/builder/TalentBuilder';
import Spinner from '~/components/styled/Spinner';
import useLocalTrees from '~/hooks/useLocalTrees';

type PageProps = {
	params: { id: string };
};

const Page = ({ params }: PageProps) => {
	const [savedSpecs, _1, specsLoading] = useLocalTrees();

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
