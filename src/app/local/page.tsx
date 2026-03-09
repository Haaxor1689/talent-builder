import { type Metadata } from 'next';

import LocalTrees from './LocalTrees';

export const metadata: Metadata = {
	title: 'Local Talent Trees',
	description: 'View and manage your local talent trees'
};

const Page = () => <LocalTrees />;

export default Page;
