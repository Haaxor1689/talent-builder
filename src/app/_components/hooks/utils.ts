export const classMask = {
	1: { name: 'Warrior', icon: 'classicon_warrior', color: '#C79C6E' },
	2: { name: 'Paladin', icon: 'classicon_paladin', color: '#F58CBA' },
	4: { name: 'Hunter', icon: 'classicon_hunter', color: '#ABD473' },
	8: { name: 'Rogue', icon: 'classicon_rogue', color: '#FFF569' },
	16: { name: 'Priest', icon: 'classicon_priest', color: '#FFFFFF' },
	32: { name: 'Shaman', icon: 'classicon_shaman', color: '#0070DE' },
	64: { name: 'Mage', icon: 'classicon_mage', color: '#40C7EB' },
	128: { name: 'Warlock', icon: 'classicon_warlock', color: '#8787ED' },
	256: { name: 'Druid', icon: 'classicon_druid', color: '#FF7D0A' }
} as const;

export const maskToClass = (mask: number) =>
	classMask[mask as never] as
		| (typeof classMask)[keyof typeof classMask]
		| undefined;
