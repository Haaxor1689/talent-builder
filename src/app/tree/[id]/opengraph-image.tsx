/* eslint-disable jsx-a11y/alt-text */

import { env } from '#env.js';
import {
	imageResponse,
	imageSize,
	randomBackground
} from '#utils/imageResponse.ts';
import { getIconPath } from '#utils/index.ts';

export const size = imageSize;
export const contentType = 'image/webp';

const Image = async ({ params }: PageProps<'/tree/[id]'>) => {
	const { id } = await params;
	const r = await fetch(`${env.DEPLOY_URL}/api/og/${id}`).then(r => r.json());
	if (!r) return undefined;
	return imageResponse(
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
				background: '#0f0d0c',
				backgroundImage: await randomBackground()
			}}
		>
			<div style={{ fontSize: 64, color: '#f9a146' }}>Talent Builder</div>

			<div
				style={{
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'center',
					gap: 16,
					alignItems: 'center',
					textAlign: 'center'
				}}
			>
				<img
					src={env.DEPLOY_URL + getIconPath(r.icon)}
					width={128}
					height={128}
				/>
				<span style={{ fontSize: 118, maxHeight: 235, overflow: 'hidden' }}>
					{r.name}
				</span>
			</div>

			{r.createdBy && (
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 16,
						fontSize: 42
					}}
				>
					<span style={{ color: '#929391' }}>Created by</span>
					{r.createdBy?.image && (
						<img
							src={`${r.createdBy.image}?size=38`}
							width={38}
							height={38}
							style={{ borderRadius: '100%' }}
						/>
					)}
					<span
						style={{
							color:
								r.createdBy.role === 'admin'
									? '#8dd958'
									: r.createdBy.role === 'supporter'
										? '#41c8d4'
										: 'white'
						}}
					>
						{r.createdBy.name}
					</span>
				</div>
			)}
		</div>
	);
};

export default Image;
