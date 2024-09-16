/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

import { ImageResponse } from 'next/og';

import { env } from '~/env';

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
	const fontinSans = await fetch(
		new URL('../assets/FontinSans-Regular.otf', import.meta.url)
	).then(res => res.arrayBuffer());

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
					backgroundImage: `url("${env.DEPLOY_URL}/page_background.png")`,
					backgroundSize: 'cover',
					backgroundPosition: 'top'
				}}
			>
				<img src={`${env.DEPLOY_URL}/icon.png`} width={128} height={128} />
				<p style={{ fontSize: 128 }}>Talent builder</p>
			</div>
		),
		{
			...size,
			fonts: [
				{
					name: 'Inter',
					data: fontinSans,
					style: 'normal',
					weight: 400
				}
			]
		}
	);
};

export default Image;
