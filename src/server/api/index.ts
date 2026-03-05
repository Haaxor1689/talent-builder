import { getSession } from '#auth/server.ts';
import { type UserRole, UserRoles } from '#server/db/schema.ts';
import { Errors } from '#utils/errors.ts';

type Session = Exclude<Awaited<ReturnType<typeof getSession>>, null>['user'];

const isRoleSufficient = (min?: UserRole, role?: UserRole): boolean =>
	UserRoles.indexOf(role as never) >= UserRoles.indexOf(min as never);

type GetUser = {
	(): Promise<Session | null>;
	(min: UserRole): Promise<Session>;
};

export const getUser: GetUser = async (min?: UserRole) => {
	const session = await getSession();
	if (min && !isRoleSufficient(min, session?.user.role))
		throw Errors.unauthorized({
			message: 'You do not have permission to perform this action'
		});
	return (session?.user ?? null) as never;
};

export const createdBySelect = {
	columns: { name: true, image: true, role: true }
} as const;
