import { type getSession } from '#auth/server.ts';
import { type UserRole, UserRoles } from '#server/db/schema.ts';

export type Session = Exclude<
	Awaited<ReturnType<typeof getSession>>,
	null
>['user'];

type UserPermFields = Pick<Session, 'id' | 'role'>;

export type VisibilityItem = {
	visibility?: 'public' | 'private' | null;
	createdById: string | null;
};

export const canView = <T extends VisibilityItem>(
	user: UserPermFields | null,
	item: T | null | undefined
) => {
	if (!item || item?.visibility === 'public') return true;
	if (user?.role === 'admin' || user?.id === item.createdById) return true;
	return false;
};

export const canEdit = <T extends VisibilityItem>(
	user: UserPermFields | null,
	item: T | null | undefined
) => {
	if (!item) return false;
	if (user?.role === 'admin' || user?.id === item.createdById) return true;
	return false;
};

export const isRoleSufficient = (min?: UserRole, role?: UserRole): boolean =>
	UserRoles.indexOf(role as never) >= UserRoles.indexOf(min as never);
