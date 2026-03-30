import { env } from '#env.js';
import {
	imageResponse,
	imageSize,
	randomBackground
} from '#utils/imageResponse.ts';

export const size = imageSize;
export const contentType = 'image/webp';

const Image = async () =>
	await imageResponse(
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				color: 'white',
				background: '#0f0d0c',
				backgroundImage: await randomBackground()
			}}
		>
			<div style={{ display: 'flex', gap: 16, paddingTop: 64 }}>
				<img
					src={`${env.DEPLOY_URL}/icon.png`}
					alt="Talent Builder Icon"
					width={128}
					height={128}
				/>
				<p style={{ fontSize: 118, color: '#f9a146' }}>Talent Builder</p>
			</div>
			<p style={{ fontSize: 36, color: '#929391', marginTop: -8 }}>
				Created by Haaxor1689
			</p>
		</div>
	);

export default Image;
