import { type Metadata } from 'next';

import TalentBuilder from '#components/builder/TalentBuilder.tsx';

export const metadata: Metadata = {
	title: 'New Talent Tree',
	description: 'Create a new talent tree'
};

const Page = () => <TalentBuilder isLocal isNew />;

export default Page;
