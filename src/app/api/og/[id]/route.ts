import { type NextRequest } from 'next/server';

import { getOgInfo } from '~/server/api/routers/openGraph';

export const dynamic = 'force-static';

export const GET = async (
	_: NextRequest,
	{ params }: { params: { id: string } }
) => {
	if (!params.id) return new Response(null, { status: 404 });
	return Response.json(await getOgInfo(params.id));
};
