import { type NextRequest, NextResponse } from 'next/server';

import { getOgInfo } from '#server/api/openGraph.ts';
import { invoke } from '#utils/index.ts';

export const GET = async (
	_: NextRequest,
	{ params }: RouteContext<'/api/og/[id]'>
) => {
	const { id } = await params;
	if (!id)
		return NextResponse.json({ error: 'No id provided' }, { status: 404 });
	return NextResponse.json(await invoke(getOgInfo({ id })));
};
