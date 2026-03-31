import { ImageResponse } from 'next/og';
import { type ReactElement } from 'react';
import sharp from 'sharp';

import { env } from '#env.js';

export const imageSize = { width: 1200, height: 630 };

const source = [
	'anniversary',
	'anomalus',
	'balor',
	'druid',
	'gm',
	'gnarlmoon',
	'grimbatol',
	'hunter',
	'lunatic',
	'northwind',
	'paladin_warlock',
	'priest',
	'rogue_mage',
	'shaman_warrior',
	'sorrowguard'
].map(src => `${env.DEPLOY_URL}/bgs/${src}.webp`);

const makeLinearFadeMaskRaw = ({
	width,
	height,
	opacity
}: {
	width: number;
	height: number;
	opacity: number;
}): Buffer => {
	const clampedOpacity = Math.max(0, Math.min(1, opacity));
	const buf = new Uint8Array(width * height * 4);

	const denom = Math.max(1, height - 1);

	for (let y = 0; y < height; y++) {
		const t = y / denom; // 0 at top, 1 at bottom
		const gradientAlpha = 1 - t; // 1..0
		const a = Math.round(255 * gradientAlpha * clampedOpacity);

		for (let x = 0; x < width; x++) {
			const i = (y * width + x) * 4;
			buf[i + 0] = 255;
			buf[i + 1] = 255;
			buf[i + 2] = 255;
			buf[i + 3] = a;
		}
	}

	return Buffer.from(buf);
};

export const randomBackground = async (): Promise<string | undefined> => {
	const img = source[Math.floor(Math.random() * source.length)];
	if (!img) return undefined;

	const imgResponse = await fetch(img);
	const imgBuffer = await imgResponse.arrayBuffer();

	const maskPng = await sharp(
		makeLinearFadeMaskRaw({
			width: imageSize.width,
			height: imageSize.height,
			opacity: 0.33
		}),
		{ raw: { width: imageSize.width, height: imageSize.height, channels: 4 } }
	)
		.png()
		.toBuffer();

	const out = await sharp(Buffer.from(imgBuffer))
		.resize(imageSize.width, imageSize.height, { fit: 'fill' })
		.ensureAlpha()
		.composite([{ input: maskPng, blend: 'dest-in' }])
		.png({ quality: 80 })
		.toBuffer();

	return `url(data:image/png;base64,${out.toString('base64')})`;
};

export const imageResponse = async (content: ReactElement) => {
	// Font
	const fontinSans = await fetch(
		`${env.DEPLOY_URL}/FontinSans-Regular.otf`
	).then(res => res.arrayBuffer());

	const imgResponse = new ImageResponse(content, {
		...imageSize,
		fonts: [{ name: 'Fontin Sans', data: fontinSans }]
	});
	const imgBuffer = await imgResponse.arrayBuffer();

	const compressed = await sharp(Buffer.from(imgBuffer))
		.webp({ quality: 80 })
		.toBuffer();

	return new Response(new Uint8Array(compressed).buffer, {
		headers: { 'Content-Type': 'image/webp' }
	});
};
