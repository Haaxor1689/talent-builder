import Link from 'next/link';

import { classMask } from '#utils/index.ts';

import ScrollArea from '../styled/ScrollArea';
import SpellIcon from '../styled/SpellIcon';

type Props = {
	urlBase?: string;
	classIds?: readonly number[];
};

const ClassCalculatorsLinks = ({ urlBase, classIds }: Props) => (
	<ScrollArea
		containerClassName="haax-surface-0"
		contentClassName="flex flex-row justify-evenly"
	>
		{Object.entries(classMask)
			.filter(([id]) => !classIds || classIds.includes(Number(id)))
			.map(([, e]) => (
				<Link
					key={e.name}
					href={`${urlBase}${e.name.toLocaleLowerCase().replaceAll(' ', '-')}`}
					className="flex flex-col items-center gap-1 p-4 pb-2 hocus:haax-highlight"
				>
					<SpellIcon icon={e.icon} className="size-12" />
					<span style={{ color: e.color }}>{e.name}</span>
				</Link>
			))}
	</ScrollArea>
);

export default ClassCalculatorsLinks;
