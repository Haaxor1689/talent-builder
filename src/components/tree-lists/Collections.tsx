import { listCollections } from '~/server/api/routers/collection';

import TextButton from '../styled/TextButton';

const Collections = async () => {
	const collections = await listCollections(undefined);
	return (
		<div className="flex flex-wrap justify-center gap-4">
			{collections.map(c => (
				<TextButton
					key={c}
					type="link"
					href={`/c/${c}`}
					className="h4 uppercase"
				>
					{c?.replaceAll('-', ' ')}
				</TextButton>
			))}
		</div>
	);
};

export default Collections;
