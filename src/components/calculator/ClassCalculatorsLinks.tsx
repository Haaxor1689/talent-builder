import Link from 'next/link';

import SpellIcon from '../styled/SpellIcon';

const ClassRecord = [
	{ name: 'Warrior', icon: 'class_warrior', color: '#C79C6E' },
	{ name: 'Paladin', icon: 'class_paladin', color: '#F58CBA' },
	{ name: 'Hunter', icon: 'class_hunter', color: '#ABD473' },
	{ name: 'Rogue', icon: 'class_rogue', color: '#FFF569' },
	{ name: 'Priest', icon: 'class_priest', color: '#FFFFFF' },
	undefined,
	{ name: 'Shaman', icon: 'class_shaman', color: '#0070DE' },
	{ name: 'Mage', icon: 'class_mage', color: '#40C7EB' },
	{ name: 'Warlock', icon: 'class_warlock', color: '#8787ED' },
	undefined,
	{ name: 'Druid', icon: 'class_druid', color: '#FF7D0A' }
];

type Props = {
	urlBase?: string;
};

const ClassCalculatorsLinks = ({ urlBase }: Props) => (
	<div className="tw-surface flex justify-evenly gap-2 overflow-x-auto p-0">
		{ClassRecord.map((e, id) =>
			!e ? null : (
				<Link
					key={id}
					href={`${urlBase}${e.name.toLocaleLowerCase()}`}
					className="tw-hocus flex shrink-0 flex-col items-center gap-1 p-4 pb-2"
				>
					<SpellIcon icon={e.icon} className="cursor-pointer" size={48} />
					<span style={{ color: e.color }}>{e.name}</span>
				</Link>
			)
		)}
	</div>
);

export default ClassCalculatorsLinks;
