import { cache } from 'react';

import { getSession } from '#auth/server.ts';
import { type UserRole } from '#server/db/schema.ts';
import { isRoleSufficient, type Session } from '#utils/auth.ts';
import { Errors } from '#utils/errors.ts';

type GetUser = {
	(): Promise<Session | null>;
	(min: UserRole): Promise<Session>;
};

export const getUser: GetUser = cache(async (min?: UserRole) => {
	const session = await getSession();
	if (min && !isRoleSufficient(min, session?.user.role))
		throw Errors.unauthorized({
			message: 'You do not have permission to perform this action'
		});
	return (session?.user ?? null) as never;
});

export const uniqueSlugException = (e: unknown) => {
	if (
		e instanceof Error &&
		e.message.match(/UNIQUE constraint failed: talent-builder_[^.]+\.slug/)
	)
		throw Errors.generic({
			message:
				'Provided custom URL is already in use. Please choose a different one.'
		});
	throw e;
};

export const createdBySelect = {
	columns: { name: true, image: true, role: true }
} as const;
