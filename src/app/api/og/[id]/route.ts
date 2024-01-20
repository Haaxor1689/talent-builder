import { eq } from 'drizzle-orm';
import { type NextRequest } from 'next/server';

import { db } from '~/server/db';
import { icons, talentTrees, users } from '~/server/db/schema';

export const GET = async (
	_: NextRequest,
	{ params }: { params: { id: string } }
) => {
	if (!params.id) return new Response(null, { status: 404 });

	const talentTree = await db.query.talentTrees.findFirst({
		where: eq(talentTrees.id, params.id)
	});

	if (!talentTree) return Response.json(null);

	// Tree icon
	const icon = await db.query.icons.findFirst({
		where: eq(icons.name, talentTree.icon)
	});
	const iconSrc = `data:image/png;base64,${icon?.data}`;

	// User
	const user = await db.query.users.findFirst({
		where: eq(users.id, talentTree.createdById)
	});

	return Response.json({
		icon: iconSrc,
		name: talentTree.name,
		sum: talentTree.tree.reduce((p, n) => p + ((n?.ranks ?? 0) || 0), 0),
		user: {
			name: user?.name,
			image: user?.image
		}
	});
};
