export const bitPack = (raw: number[][]): string =>
	raw
		.map(tree => {
			if (tree.length % 4 !== 0)
				tree = [...tree, ...Array(4 - (tree.length % 4)).fill(0)];

			const binaryString = tree
				.map(num => num?.toString(2).padStart(3, '0') ?? '000')
				.join('');

			const byteArray = (binaryString.match(/.{1,8}/g) ?? []).map(byte =>
				parseInt(byte, 2)
			);

			return btoa(String.fromCharCode(...byteArray)).slice(0, -1);
		})
		.join('-');

export const legacyBitUnpack = (str: string): number[][] =>
	str?.split('-').map(t => [...t].map(Number)) as never;

export const bitUnpack = (raw: string): number[][] => {
	const trees = raw.split('-');
	if (trees.length !== 3) throw new Error('Invalid Base64 format');
	return trees.map(tree => {
		// Convert Base64 string to binary string
		const binaryString = [...atob(tree)]
			.map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
			.join('');

		// Convert binary string to raw values
		return (binaryString.match(/.{1,3}/g) ?? []).map(bits => parseInt(bits, 2));
	});
};
