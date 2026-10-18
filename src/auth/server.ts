import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { cache } from 'react';
import { z } from 'zod';

import { env } from '#env.js';
import { db } from '#server/db/index.ts';
import { type UserRole, UserRoles } from '#server/db/schema.ts';

export const auth = betterAuth({
	baseURL: env.DEPLOY_URL,
	database: drizzleAdapter(db, { provider: 'sqlite' }),
	user: {
		additionalFields: {
			role: { type: UserRoles, defaultValue: 'user', input: false }
		}
	},
	databaseHooks: {
		user: {
			update: {
				after: async user => revalidateTag(`users:id:${user.id}`, { expire: 0 })
			}
		}
	},
	socialProviders: {
		discord: {
			clientId: env.AUTH_DISCORD_ID,
			clientSecret: env.AUTH_DISCORD_SECRET,
			overrideUserInfoOnSignIn: true,
			mapProfileToUser: async profile => ({
				id: profile.id,
				name: profile.username,
				email: profile.email,
				emailVerified: profile.verified,
				image: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.webp`,
				role: await getUserRole(profile.id)
			})
		}
	}
});

export const getSession = cache(
	async () => await auth.api.getSession({ headers: await headers() })
);

const MemberSchema = z.object({ roles: z.array(z.string()) });
const GUILD = '1470042728896139468';
const ROLES = [
	{ id: '1477020159037407324', role: 'admin' },
	{ id: '1470044435122360553', role: 'supporter' }
] as const;

const getDiscordRole = async (userId: string) => {
	try {
		const r = await fetch(
			`https://discord.com/api/guilds/${GUILD}/members/${userId}`,
			{ headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` } }
		);
		const { roles } = MemberSchema.parse(await r.json());
		return ROLES.find(({ id }) => roles.includes(id))?.role ?? 'user';
	} catch {
		return 'user';
	}
};

const getUserRole = async (userId: string): Promise<UserRole> => {
	const [discordRole, kofi] = await Promise.all([
		getDiscordRole(userId),
		db.query.kofiSupporters.findFirst({ where: { discordId: userId } })
	]);
	if (discordRole !== 'user') return discordRole;
	return kofi ? 'supporter' : 'user';
};
