/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

import { ImageResponse } from 'next/og';

import { env } from '~/env';
import { getIconPath } from '~/utils';

import { type PageProps } from './page';

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
const Image = async ({ params }: PageProps) => {
	const response = await fetch(`${env.DEPLOY_URL}/api/og/${params.id}`).then(
		r => r.json()
	);

	if (!response) return undefined;

	// Font
	const fontinSans = await fetch(
		new URL('../../../assets/FontinSans-Regular.otf', import.meta.url)
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
					gap: 8,
					color: 'white',
					background: '#181412',
					backgroundImage: `url("${env.DEPLOY_URL}/page_background.png")`
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
						paddingBottom: 8,
						maxWidth: '90%',
						textAlign: 'center'
					}}
				>
					<img
						src={env.DEPLOY_URL + getIconPath(response.icon)}
						width={64}
						height={64}
					/>
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
							<img
								src={response.user?.image ?? ''}
								width={42}
								height={42}
								style={{ borderRadius: '100%' }}
							/>
						)}
						<span
							style={
								response.user.isAdmin
									? { color: '#8DD958', fontWeight: 600 }
									: undefined
							}
						>
							{response.user?.name}
						</span>
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
