import { Suspense } from 'react';

import Spinner from '#components/styled/Spinner.tsx';
import TextButton from '#components/styled/TextButton.tsx';
import { listCollections } from '#server/api/collection.ts';

const Page = async () => {
	const collections = await listCollections();
	return (
		<>
			<h2 className="haax-color mt-4 -mb-2 text-center">Talent Collections</h2>
			<Suspense fallback={<Spinner className="my-6 self-center" />}>
				<div className="grid auto-cols-fr items-stretch justify-stretch gap-3 md:grid-flow-col md:gap-5">
					{collections.map(c => (
						<div key={c} className="haax-surface-0">
							<TextButton
								type="link"
								href={`/collections/${c}`}
								className="w-full justify-center p-5 text-2xl uppercase"
							>
								{c?.replaceAll('-', ' ')}
							</TextButton>
						</div>
					))}
				</div>
			</Suspense>
		</>
	);
};

export default Page;
