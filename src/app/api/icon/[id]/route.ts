import { type NextRequest } from 'next/server';

import { api } from '~/trpc/server';

export const GET = async (
	_: NextRequest,
	{ params }: { params: { id: string } }
) => {
	if (!params.id) return new Response(null, { status: 404 });

	const img = await api.icon.get.query(params.id);

	if (!img) return new Response(null, { status: 404 });

	// Decode from base64
	const data = Buffer.from(img.data, 'base64');
	return new Response(data, { headers: { 'content-type': 'image/png' } });
};

export const POST = async (
	req: NextRequest,
	{ params }: { params: { id: string } }
) => {
	if (!params.id) return new Response(null, { status: 404 });

	await api.icon.upsert.mutate({ name: params.id, data: await req.text() });

	return new Response(null, { status: 200 });
};
