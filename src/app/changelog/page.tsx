import { type Metadata } from 'next';
import dedent from 'dedent';

import Md from '#components/styled/Md.tsx';

export const metadata: Metadata = {
	title: 'Changelog',
	description: 'Recent Talent Builder feature updates and fixes'
};

const changelogText = dedent`
# In progress

- **Builder mobile improvements** Adjusted various elements and interactions in the talent builder for a better mobile experience on smaller screens.
- **Icon picker improvements** The icons in the grid at the bottom are now sorted by name for easier browsing and the height of the container has been increased to show more icons at once.

# March 12, 2026

- **Support for different tree layouts** Talent editor now handles multiple tree sizes. Filters have been added to the tree list and calculator to reflect this, and the talent tree listings now show which layout they use, and the calculator will automatically select the correct one when loading builds.
- **Collection page redirects** Old collection links will now redirect to the new collection pages.
- **Performance improvements** Talent and build tooltips were optimized to feel smoother, especially in heavy calculator views.
- **General builder and calculator polish** Several parts of the builder, calculator, previews, dialogs, and top bar were cleaned up for a more consistent experience.
`;

const Page = () => (
	<>
		<h2 className="haax-color -mb-3 text-center md:text-left">Changelog</h2>
		<div className="haax-surface-3 md:haax-surface-5">
			<Md text={changelogText} />
		</div>
	</>
);

export default Page;
