import dedent from 'dedent';

const changelog = [
	dedent`
		# July 09, 2026

		- **Cleaner tree links** Talent tree pages now use clearer links, and older links continue to work through automatic redirects.
		- **Better in-page guidance** The builder and calculator now include instructions sections describing how to use each feature.
		- **Safer custom URLs** Some protected words are now blocked when saving custom links to avoid confusing or broken pages.
		- **Page polish and discovery** Several pages were cleaned up and public content is now easier to discover.
		- **Better sharing and search behavior** Shared links now have more consistent previews, private or invalid pages are less likely to appear in search, and missing pages show clearer information.
`,
	dedent`
		# March 30, 2026

		- **Collections 2.0** The collections feature has been rewritten and made available to supporters. You can now create custom private and public collections and assign trees for convenient calculator access and sharing.
		- **Builder mobile improvements** Adjusted various elements and interactions in the talent builder for a better mobile experience on smaller screens.
		- **Icon picker improvements** The icons in the grid at the bottom are now sorted by name for easier browsing and the height of the container has been increased to show more icons at once.
		- **Custom URL slugs** Supporters can now customize URLs for talent trees, collections and builds.
`,
	dedent`
		# March 12, 2026

		- **Support for different tree layouts** Talent editor now handles multiple tree sizes. Filters have been added to the tree list and calculator to reflect this, and the talent tree listings now show which layout they use, and the calculator will automatically select the correct one when loading builds.
		- **Collection page redirects** Old collection links will now redirect to the new collection pages.
		- **Performance improvements** Talent and build tooltips were optimized to feel smoother, especially in heavy calculator views.
		- **General builder and calculator polish** Several parts of the builder, calculator, previews, dialogs, and top bar were cleaned up for a more consistent experience.
`
];

export default changelog;
