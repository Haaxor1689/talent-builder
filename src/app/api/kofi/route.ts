import { timingSafeEqual } from 'node:crypto';

import { and, eq } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { env } from '#env.js';
import { db } from '#server/db/index.ts';
import { kofiSupporters, user } from '#server/db/schema.ts';

const KofiPayload = z.object({
	verification_token: z.string(),
	discord_userid: z.string().nullish()
});

const isValidToken = (token: string) => {
	const a = Buffer.from(token);
	const b = Buffer.from(env.KOFI_VERIFICATION_TOKEN);
	return a.length === b.length && timingSafeEqual(a, b);
};

const readBody = async (req: NextRequest): Promise<unknown> => {
	if (req.headers.get('content-type')?.includes('application/json'))
		return await req.json();
	const data = (await req.formData()).get('data');
	return typeof data === 'string' ? JSON.parse(data) : null;
};

export const POST = async (req: NextRequest) => {
	const parsed = KofiPayload.safeParse(await readBody(req).catch(() => null));
	if (!parsed.success) return new NextResponse('Bad request', { status: 400 });

	const { verification_token, discord_userid } = parsed.data;
	if (!isValidToken(verification_token))
		return new NextResponse('Unauthorized', { status: 401 });

	if (!discord_userid) return new NextResponse(null, { status: 200 });

	await db
		.insert(kofiSupporters)
		.values({ discordId: discord_userid, createdAt: new Date() })
		.onConflictDoNothing();

	const linked = await db.query.account.findFirst({
		where: { providerId: 'discord', accountId: discord_userid },
		columns: { userId: true }
	});
	if (!linked) return new NextResponse(null, { status: 200 });

	// Only upgrade plain users so admins keep their role
	const updated = await db
		.update(user)
		.set({ role: 'supporter', updatedAt: new Date() })
		.where(and(eq(user.id, linked.userId), eq(user.role, 'user')))
		.returning({ id: user.id });

	if (updated.length) revalidateTag(`users:id:${linked.userId}`, { expire: 0 });

	return new NextResponse(null, { status: 200 });
};
