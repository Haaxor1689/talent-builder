import { DrizzleAdapter } from '@auth/drizzle-adapter';
import NextAuth, { type DefaultSession } from 'next-auth';
import { type DiscordProfile } from 'next-auth/providers/discord';
import Discord from 'next-auth/providers/discord';
import { revalidatePath, revalidateTag } from 'next/cache';
import { cache } from 'react';
import { eq } from 'drizzle-orm';

import { db } from '~/server/db';
import {
	accounts,
	sessions,
	talentTrees,
	users,
	verificationTokens
} from '~/server/db/schema';

import { getFullTag } from './api/helpers';

declare module 'next-auth' {
	// eslint-disable-next-line
	interface User {
		isAdmin?: boolean;
	}

	// eslint-disable-next-line
	interface Session extends DefaultSession {
		user: {
			id: string;
			isAdmin: boolean;
		} & DefaultSession['user'];
	}

	// eslint-disable-next-line
	interface Profile extends DiscordProfile {}
}

export const { auth, handlers, signIn, signOut } = NextAuth({
	trustHost: true,
	callbacks: {
		session: ({ session, user }) => ({
			...session,
			user: {
				...session.user,
				id: user.id,
				isAdmin: user.isAdmin
			}
		})
	},
	adapter: DrizzleAdapter(db, {
		usersTable: users,
		accountsTable: accounts,
		sessionsTable: sessions,
		verificationTokensTable: verificationTokens
	}),
	providers: [Discord],
	events: {
		signIn: async ({ user, profile, isNewUser }) => {
			if (isNewUser) return;
			if (!user.id) return;
			if (profile?.image === user.image && profile?.name === user.name) return;

			// Update user profile
			await db
				.update(users)
				.set({ image: profile?.image_url, name: profile?.name })
				.where(eq(users.id, user.id));

			// Revalidate OG images
			const trees = await db.query.talentTrees.findMany({
				where: eq(talentTrees.createdById, user.id)
			});
			trees.forEach(tree => {
				revalidateTag(getFullTag('getOgInfo', tree.id));
				revalidatePath(`/api/og/${tree.id}`);
			});
		}
	}
});

export const getServerAuthSession = cache(() => auth());
