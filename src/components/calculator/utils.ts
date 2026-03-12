import { logger } from '#utils/index.ts';

export const bitPack = (raw: number[][]): string =>
	raw
		.map(tree => {
			// Trim trailing zeros for sparse arrays
			const trimmed = Array.isArray(tree) ? [...tree] : [];
			while (trimmed.length > 0 && trimmed[trimmed.length - 1] === 0) {
				trimmed.pop();
			}

			if (trimmed.length === 0) return '';

			let binaryString = trimmed
				.map(num => (num ?? 0).toString(2).padStart(3, '0'))
				.join('');

			// Pad binary string to multiple of 8
			if (binaryString.length % 8 !== 0) {
				binaryString = binaryString.padEnd(
					binaryString.length + (8 - (binaryString.length % 8)),
					'0'
				);
			}

			const byteArray = (binaryString.match(/.{1,8}/g) ?? []).map(byte =>
				parseInt(byte, 2)
			);

			return btoa(String.fromCharCode(...byteArray)).replace(/=+$/, '');
		})
		.join('-');

export const legacyBitUnpack = (str: string): number[][] =>
	str?.split('-').map(t => [...t].map(Number)) as never;

export const bitUnpack = (raw: string): number[][] => {
	if (!raw) return [[], [], []];

	const trees = raw.split('-');
	if (trees.length !== 3) throw new Error('Invalid Base64 format');
	return trees.map(tree => {
		if (!tree) return [];

		// Properly pad Base64 string before decoding
		const padded = tree.padEnd(
			tree.length + ((4 - (tree.length % 4)) % 4),
			'='
		);

		try {
			// Convert Base64 string to binary string
			const binaryString = [...atob(padded)]
				.map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
				.join('');

			// Convert binary string to raw values (exact 3-bit groups only)
			return (binaryString.match(/.{3}/g) ?? []).map(bits => parseInt(bits, 2));
		} catch (err) {
			logger.error({ message: 'Error decoding Base64 string:', err });
			return []; // Return empty array on decoding error
		}
	});
};
