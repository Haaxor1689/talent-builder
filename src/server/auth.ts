import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq } from 'drizzle-orm';
import {
	getServerSession,
	type DefaultSession,
	type NextAuthOptions
} from 'next-auth';
import { type Adapter } from 'next-auth/adapters';
import DiscordProvider, {
	type DiscordProfile
} from 'next-auth/providers/discord';
import { revalidateTag } from 'next/cache';

import { env } from '~/env';
import { db } from '~/server/db';
import { mysqlTable, talentTrees, users } from '~/server/db/schema';

import { getTag } from './api/helpers';

declare module 'next-auth' {
	// eslint-disable-next-line
	interface Session extends DefaultSession {
		user: {
			id: string;
		} & DefaultSession['user'];
	}

	// eslint-disable-next-line
	interface Profile extends DiscordProfile {}
}

export const authOptions: NextAuthOptions = {
	callbacks: {
		session: ({ session, user }) => ({
			...session,
			user: {
				...session.user,
				id: user.id
			}
		})
	},
	adapter: DrizzleAdapter(db, mysqlTable) as Adapter,
	providers: [
		DiscordProvider({
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET
		})
	],
	events: {
		signIn: async ({ user, profile, isNewUser }) => {
			if (isNewUser) return;
			if (profile?.image === user.image && profile?.name === user.name) return;

			// Update user profile
			await db
				.update(users)
				.set({ image: profile?.image, name: profile?.name })
				.where(eq(users.id, user.id));

			// Revalidate OG images
			const trees = await db.query.talentTrees.findMany({
				where: eq(talentTrees.createdById, user.id)
			});
			trees.forEach(tree => revalidateTag(getTag('getOgInfo', tree.id)));
		}
	}
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
