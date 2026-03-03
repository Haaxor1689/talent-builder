'use client';

import { notFound, useParams } from 'next/navigation';

import TalentBuilder from '#components/builder/TalentBuilder.tsx';
import useLocalTrees from '#hooks/useLocalTrees.ts';

const Page = () => {
	const { id } = useParams();
	const [savedSpecs] = useLocalTrees();
	const localSpec = savedSpecs?.[`${id}`];
	if (!localSpec) return notFound();

	return <TalentBuilder defaultValues={localSpec} isLocal />;
};

export default Page;
