import Link from 'next/link';

import { classMask } from '#utils/index.ts';

import ScrollArea from '../styled/ScrollArea';
import SpellIcon from '../styled/SpellIcon';

type Props = {
	urlBase?: string;
};

const ClassCalculatorsLinks = ({ urlBase }: Props) => (
	<ScrollArea
		containerClassName="haax-surface-0"
		contentClassName="flex flex-row justify-evenly"
	>
		{Object.values(classMask).map(e =>
			!e ? null : (
				<Link
					key={e.name}
					href={`${urlBase}${e.name.toLocaleLowerCase()}`}
					className="hocus:haax-highlight flex flex-col items-center gap-1 p-4 pb-2"
				>
					<SpellIcon icon={e.icon} className="size-12" />
					<span style={{ color: e.color }}>{e.name}</span>
				</Link>
			)
		)}
	</ScrollArea>
);

export default ClassCalculatorsLinks;
