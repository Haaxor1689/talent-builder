import { type Metadata } from 'next';

import Md from '#components/styled/Md.tsx';

import changelog from './changelog';

export const metadata: Metadata = {
	title: 'Changelog',
	description: 'Recent Talent Builder feature updates and fixes'
};

const Page = () => (
	<>
		<h2 className="-mb-3 haax-color text-center md:text-left">Changelog</h2>
		{changelog.map((text, index) => (
			<div key={index} className="haax-surface-3 md:haax-surface-5">
				<Md text={text} />
			</div>
		))}
	</>
);

export default Page;
