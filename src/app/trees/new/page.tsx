import { type Metadata } from 'next';

import TalentBuilder from '#components/builder/TalentBuilder.tsx';
import { TalentForm } from '#server/schemas.ts';

export const metadata: Metadata = {
	title: 'New Talent Tree',
	description: 'Create a new talent tree',
	robots: { index: false, follow: false }
};

const Page = () => <TalentBuilder defaultValues={TalentForm.parse({})} />;

export default Page;
