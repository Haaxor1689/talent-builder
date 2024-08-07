import { type NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';

import { env } from '~/env';

export const GET = async (
	_: NextRequest,
	{ params }: { params: { id: string } }
) => {
	if (!params.id) return new Response(null, { status: 404 });

	const input = params.id.slice(1);
	const wowHeadIcon = await fetch(
		`https://wow.zamimg.com/images/wow/icons/large/${input}.jpg`
	);

	const size = { width: 64, height: 64 };
	return new ImageResponse(
		(
			<div
				style={{
					position: 'relative',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					...size
				}}
			>
				{wowHeadIcon.ok ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={`https://wow.zamimg.com/images/wow/icons/large/${input}.jpg`}
						alt={input}
						{...size}
						style={{ padding: 4 }}
					/>
				) : (
					<div
						style={{
							textAlign: 'center',
							color: 'red',
							fontSize: 10,
							wordBreak: 'break-all',
							padding: 6
						}}
					>
						{input}
					</div>
				)}
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						...size,
						backgroundImage: `url("${env.DEPLOY_URL}/icon_frame.png")`
					}}
				/>
			</div>
		),
		size
	);
};
