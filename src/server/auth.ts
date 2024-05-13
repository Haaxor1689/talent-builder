import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq } from 'drizzle-orm';
import {
	type DefaultUser,
	getServerSession,
	type DefaultSession,
	type NextAuthOptions
} from 'next-auth';
import { type Adapter } from 'next-auth/adapters';
import { type DiscordProfile } from 'next-auth/providers/discord';
import GithubProvider from 'next-auth/providers/github';
import { revalidatePath, revalidateTag } from 'next/cache';
import {
	type OAuthConfig,
	type OAuthUserConfig
} from 'next-auth/providers/oauth';
import { cache } from 'react';

import { env } from '~/env';
import { db } from '~/server/db';
import {
	accounts,
	sessions,
	talentTrees,
	users,
	verificationTokens
} from '~/server/db/schema';

import { getFullTag } from './api/helpers';

const DiscordProvider = <P extends DiscordProfile>(
	options: OAuthUserConfig<P>
): OAuthConfig<P> => ({
	id: 'discord',
	name: 'Discord',
	type: 'oauth',
	authorization:
		'https://discord.com/api/oauth2/authorize?scope=identify+email+guilds',
	token: 'https://discord.com/api/oauth2/token',
	userinfo: 'https://discord.com/api/users/@me',
	profile: profile => {
		if (profile.avatar === null) {
			const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
			profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
		} else {
			const format = profile.avatar.startsWith('a_') ? 'gif' : 'png';
			profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
		}

		return {
			id: profile.id,
			name: profile.username,
			email: profile.email,
			image: profile.image_url
		};
	},
	style: { logo: '/discord.svg', bg: '#5865F2', text: '#fff' },
	options
});

declare module 'next-auth' {
	// eslint-disable-next-line
	interface User extends DefaultUser {
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

export const authOptions: NextAuthOptions = {
	callbacks: {
		signIn: async ({ account }) => {
			if (account?.provider === 'discord') {
				const guilds = await fetch('https://discord.com/api/users/@me/guilds', {
					headers: {
						Authorization: `Bearer ${account.access_token}`
					}
				}).then(res => res.json());
				const isClassChangesMember = !!(guilds as { id: string }[])?.find(
					g => g?.id === '1034290945597902878'
				);
				if (!isClassChangesMember) return '/unauthorized';
			}
			if (account?.provider === 'github') {
				// Hardcoded workaround for Muigin's GitHub account
				if (account.providerAccountId !== '166345821') return '/unauthorized';
			}
			return true;
		},
		session: ({ session, user }) => ({
			...session,
			user: {
				...session.user,
				id: user.id,
				isAdmin: user.isAdmin
			}
		})
	},
	adapter: DrizzleAdapter(
		db,
		// Know issue workaround https://github.com/nextauthjs/next-auth/discussions/8758#discussioncomment-8833831
		{
			usersTable: users,
			accountsTable: accounts,
			sessionsTable: sessions,
			verificationTokensTable: verificationTokens
		} as never
	) as Adapter,
	providers: [
		DiscordProvider({
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET
		}),
		GithubProvider({
			clientId: env.GITHUB_ID,
			clientSecret: env.GITHUB_SECRET
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
			trees.forEach(tree => {
				revalidateTag(getFullTag('getOgInfo', tree.id));
				revalidatePath(`/api/og/${tree.id}`);
			});
		}
	}
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = cache(() => getServerSession(authOptions));
