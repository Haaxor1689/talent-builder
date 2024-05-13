import Link from 'next/link';
import { Suspense } from 'react';

import PersonalBuilds from '../_components/builds-lists/PersonalBuilds';
import TurtleBuilds from '../_components/builds-lists/TurtleBuilds';
import Spinner from '../_components/styled/Spinner';
import TalentIcon from '../_components/styled/TalentIcon';

export const fetchCache = 'default-no-store';

const Page = () => (
	<>
		<Suspense fallback={<Spinner className="my-6 self-center" />}>
			<TurtleBuilds />
		</Suspense>

		<div className="flex items-center justify-center gap-2">
			<Link
				href="/calculator/custom"
				className="tw-hocus flex shrink-0 items-center gap-3 p-2"
			>
				<TalentIcon showDefault className="shrink-0 cursor-pointer" />
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
