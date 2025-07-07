import { NextResponse, type NextRequest } from 'next/server';

import { getOgInfo } from '~/server/api/routers/openGraph';

export const dynamic = 'force-static';

export const GET = async (
	_: NextRequest,
	{ params }: { params: { id: string } }
) => {
	if (!params.id)
		return NextResponse.json({ error: 'No id provided' }, { status: 404 });
	return NextResponse.json(await getOgInfo(params.id));
};
