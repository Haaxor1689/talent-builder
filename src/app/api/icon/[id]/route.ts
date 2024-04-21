import { type NextRequest } from 'next/server';

import { getIconData } from '~/server/api/routers/icon';

export const dynamic = 'force-static';

export const GET = async (
	_: NextRequest,
	{ params }: { params: { id: string } }
) => {
	if (!params.id) return new Response(null, { status: 404 });

	const img = await getIconData(params.id);

	// Decode from base64
	const data = Buffer.from(img, 'base64');
	return new Response(data, { headers: { 'content-type': 'image/png' } });
};
