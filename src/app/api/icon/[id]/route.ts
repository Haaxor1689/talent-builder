import { type NextRequest } from 'next/server';

import { getIcon, upsertIcon } from '~/server/api/routers/icon';

export const GET = async (
	_: NextRequest,
	{ params }: { params: { id: string } }
) => {
	if (!params.id) return new Response(null, { status: 404 });

	const img = await getIcon(params.id);

	if (!img)
		return Response.redirect(
			`https://wow.zamimg.com/images/wow/icons/large/${params.id}.jpg`
		);

	// Decode from base64
	const data = Buffer.from(img.data, 'base64');
	return new Response(data, { headers: { 'content-type': 'image/png' } });
};

export const POST = async (
	req: NextRequest,
	{ params }: { params: { id: string } }
) => {
	if (!params.id) return new Response(null, { status: 404 });

	await upsertIcon({ name: params.id, data: await req.text() });

	return new Response(null, { status: 200 });
};
