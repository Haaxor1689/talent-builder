export const bitPack = (raw: number[][]): string => {
	const to3BitBinary = (num: number) => num.toString(2).padStart(3, '0');
	return raw
		.map(tree => {
			const binaryString = tree.map(to3BitBinary).join('');

			// Convert binary string to a byte array
			const byteArray = (binaryString.match(/.{1,8}/g) ?? []).map(byte =>
				parseInt(byte, 2)
			);

			// Convert byte array to Base64 string
			const base64String = btoa(String.fromCharCode(...byteArray)).slice(0, -1);

			// Slice trailing 'A's
			return base64String.replace(/A+$/, '');
		})
		.join('-');
};

export const legacyBitUnpack = (str: string): number[][] =>
	str?.split('-').map(t => [...t].map(Number)) as never;

export const bitUnpack = (base64: string): number[][] => {
	const trees = base64.split('-');
	if (trees.length !== 3) throw new Error('Invalid Base64 format');

	return trees.map(tree => {
		// Ensure the string is at least 14 characters long
		const padded = tree.padEnd(14, 'A');

		// Convert Base64 string to binary string
		const binaryString = [...atob(padded)]
			.map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
			.join('');

		// Convert binary string to raw values
		return [
			...(binaryString.match(/.{1,3}/g) ?? []).map(bits => parseInt(bits, 2)),
			0
		];
	});
};
