export const GameVersions = [
	{ name: 'Custom', rows: -1, img: '/logo_custom.webp' },
	{ name: '1.12.1', rows: 7, img: '/logo_vanilla.webp' },
	{ name: '2.4.3', rows: 9, img: '/logo_tbc.gif' },
	{ name: '3.3.5', rows: 11, img: '/logo_wotlk.webp' }
] as const;

export const GameVersionLogo = ({ rows }: { rows?: number }) => {
	const version = GameVersions.find(v => v.rows === rows) ?? GameVersions[0];
	return (
		<img src={version.img} alt={version.name} className="w-8 object-contain" />
	);
};
