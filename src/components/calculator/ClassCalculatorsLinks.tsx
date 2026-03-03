import Link from 'next/link';

import ScrollArea from '../styled/ScrollArea';
import SpellIcon from '../styled/SpellIcon';

const ClassRecord = [
	{ name: 'Warrior', icon: 'class_warrior', color: '#/C79C6E' },
	{ name: 'Paladin', icon: 'class_paladin', color: '#/F58CBA' },
	{ name: 'Hunter', icon: 'class_hunter', color: '#/ABD473' },
	{ name: 'Rogue', icon: 'class_rogue', color: '#/FFF569' },
	{ name: 'Priest', icon: 'class_priest', color: '#/FFFFFF' },
	undefined,
	{ name: 'Shaman', icon: 'class_shaman', color: '#/0070DE' },
	{ name: 'Mage', icon: 'class_mage', color: '#/40C7EB' },
	{ name: 'Warlock', icon: 'class_warlock', color: '#/8787ED' },
	undefined,
	{ name: 'Druid', icon: 'class_druid', color: '#/FF7D0A' }
];

type Props = {
	urlBase?: string;
};

const ClassCalculatorsLinks = ({ urlBase }: Props) => (
	<ScrollArea
		containerClassName="haax-surface-0"
		contentClassName="flex flex-row justify-evenly"
	>
		{ClassRecord.map(e =>
			!e ? null : (
				<Link
					key={e.name}
					href={`${urlBase}${e.name.toLocaleLowerCase()}`}
					className="hocus:haax-highlight flex flex-col items-center gap-1 p-4 pb-2"
				>
					<SpellIcon icon={e.icon} className="cursor-pointer" size={48} />
					<span style={{ color: e.color }}>{e.name}</span>
				</Link>
			)
		)}
	</ScrollArea>
);

export default ClassCalculatorsLinks;
