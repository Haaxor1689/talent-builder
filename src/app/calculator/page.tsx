import Link from 'next/link';
import { Suspense } from 'react';

import PersonalBuilds from '~/components/builds-lists/PersonalBuilds';
import Spinner from '~/components/styled/Spinner';
import SpellIcon from '~/components/styled/SpellIcon';

const Page = () => (
	<>
		<div className="flex items-center justify-center gap-2">
			<Link
				href="/calculator/custom"
				className="tw-hocus flex shrink-0 items-center gap-3 p-2"
			>
				<SpellIcon showDefault className="shrink-0 cursor-pointer" />
				<div className="flex flex-col gap-1 text-inherit">
					<p className="truncate text-lg text-inherit">Custom</p>
					<div className="flex items-center gap-1.5 truncate text-blueGray">
						Create new custom tree
					</div>
				</div>
			</Link>
		</div>

		<Suspense fallback={<Spinner className="my-6 self-center" />}>
			<PersonalBuilds />
		</Suspense>
	</>
);

export default Page;
