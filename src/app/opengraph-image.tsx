/* eslint-disable jsx-a11y/alt-text */
import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Talent builder';
export const size = {
	width: 1200,
	height: 630
};

export const contentType = 'image/png';

const Image = async () => {
	// Font
	const fontinSans = fetch(
		new URL('./_components/assets/FontinSans-Regular.otf', import.meta.url)
	).then(res => res.arrayBuffer());

	// Website logo
	const logo = await fetch(
		new URL('../../public/icon.png', import.meta.url).toString()
	).then(res => res.arrayBuffer());
	const logoSrc = `data:image/png;base64,${Buffer.from(logo).toString(
		'base64'
	)}`;

	// Background image
	const bg = await fetch(
		new URL('../../public/page_background_min.png', import.meta.url).toString()
	).then(res => res.arrayBuffer());
	const bgSrc = `data:image/png;base64,${Buffer.from(bg).toString('base64')}`;

	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 32,
					color: 'white',
					textTransform: 'uppercase',
					background: '#181412',
					backgroundImage: `url("${bgSrc}")`,
					backgroundSize: 'cover',
					backgroundPosition: 'top'
				}}
			>
				<img src={logoSrc} width={128} height={128} />
				<p style={{ fontSize: 128 }}>Talent builder</p>
			</div>
		),
		{
			...size,
			fonts: [
				{
					name: 'Inter',
					data: await fontinSans,
					style: 'normal',
					weight: 400
				}
			]
		}
	);
};

export default Image;
