import { eq } from 'drizzle-orm';
import { ImageResponse } from 'next/og';
import { db } from '~/server/db';
import { icons, talentTrees, users } from '~/server/db/schema';
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
export default async function Image({ params }: { params: { id: string } }) {
	const talentTree = await db.query.talentTrees.findFirst({
		where: eq(talentTrees.id, params.id)
	});
	if (!talentTree) return await defaultImage();

	// Font
	const fontinSans = fetch(
		new URL('../_components/assets/FontinSans-Regular.otf', import.meta.url)
	).then(res => res.arrayBuffer());

	// Background image
	const bg = await fetch(
		new URL('../../../public/page_background.png', import.meta.url).toString()
	).then(res => res.arrayBuffer());
	const bgSrc = `data:image/png;base64,${Buffer.from(bg).toString('base64')}`;

	// Tree icon
	const icon = await db.query.icons.findFirst({
		where: eq(icons.name, talentTree.icon)
	});
	const iconSrc = `data:image/png;base64,${icon?.data}`;

	// User
	const user = await db.query.users.findFirst({
		where: eq(users.id, talentTree.createdById)
	});

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
					backgroundImage: `url("${bgSrc}")`,
					backgroundSize: 'cover',
					backgroundPosition: 'top'
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
					<img src={iconSrc} width={64} height={64} />
					<div style={{ fontSize: 86 }}>{talentTree.name}</div>
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
					{talentTree.tree.reduce((p, n) => p + (n?.ranks || 0), 0)}
				</div>

				{user?.name && (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 8,
							fontSize: 42
						}}
					>
						<span style={{ color: '#929391' }}>Author:</span>
						{user?.image && (
							<img src={user?.image ?? ''} width={42} height={42} />
						)}
						{user?.name}
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
}
