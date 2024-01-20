/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

import { ImageResponse } from 'next/og';

import { type TalentTreeT } from '~/server/api/types';

import defaultImage from '../opengraph-image';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Talent builder';
export const size = {
	width: 1200,
	height: 630
};

export const contentType = 'image/png';

// Image generation
const Image = async ({ params }: { params: { id: string } }) => {
	const response = await fetch(
		`http://localhost:3000/api/og/${params.id}`
	).then(r => r.json());

	if (!response) return await defaultImage();

	// Font
	const fontinSans = fetch(
		new URL('../_components/assets/FontinSans-Regular.otf', import.meta.url)
	).then(res => res.arrayBuffer());

	// Background image
	const bg = await fetch(
		new URL(
			'../../../public/page_background_min.png',
			import.meta.url
		).toString()
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
					gap: 8,
					color: 'white',
					background: '#181412',
					backgroundImage: `url("${bgSrc}")`
				}}
			>
				<div style={{ fontSize: 32, textTransform: 'uppercase' }}>
					Talent builder
				</div>

				<div
					style={{
						display: 'flex',
						gap: 8,
						alignItems: 'center',
						paddingTop: 16,
						paddingBottom: 8
					}}
				>
					<img src={response.icon} width={64} height={64} />
					<div style={{ fontSize: 86 }}>{response.name}</div>
				</div>

				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 8,
						fontSize: 42
					}}
				>
					<span style={{ color: '#929391' }}>Total points: </span>
					{response.sum}
				</div>

				{response.user?.name && (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 8,
							fontSize: 42
						}}
					>
						<span style={{ color: '#929391' }}>Author:</span>
						{response.user?.image && (
							<img src={response.user?.image ?? ''} width={42} height={42} />
						)}
						{response.user?.name}
					</div>
				)}
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
