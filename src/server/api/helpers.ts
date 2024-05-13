/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { type Session } from 'next-auth';

import { db } from '../db';
import { getServerAuthSession } from '../auth';

type SessionTagType = 'user' | 'role' | 'any';

const getSessionTag = (session: Session | null, sessionType?: SessionTagType) =>
	`session:[${
		sessionType === 'any'
			? !!session
			: sessionType === 'user'
			? session?.user?.id ?? 'none'
			: sessionType === 'role'
			? session?.user.isAdmin
				? 'admin'
				: 'user'
			: 'none'
	}]`;

export const getQueryTag = (queryKey: string) => `api:[${queryKey}]`;

export const getFullTag = (queryKey: string, input: unknown) =>
	`api:[${queryKey}] | input:[${JSON.stringify(input)}]`;

export const publicProcedure =
	<
		Func extends (args: {
			input: z.infer<Input>;
			db: typeof db;
			session: Awaited<ReturnType<typeof getServerAuthSession>>;
		}) => Promise<any>,
		Input extends z.ZodTypeAny = z.ZodUndefined
	>({
		input,
		queryKey,
		query,
		sessionType
	}: {
		input?: Input;
		queryKey?: string;
		query: Func;
		sessionType?: SessionTagType;
	}) =>
	async (val: z.infer<Input>): Promise<Awaited<ReturnType<Func>>> => {
		const values = (input ?? z.undefined()).parse(val);
		const session = !sessionType ? null : await getServerAuthSession();

		if (!queryKey)
			return cache(() => query({ input: values, db, session }))() as never;

		const queryTag = getQueryTag(queryKey);
		const fullTag = getFullTag(queryKey, values);
		const sessionTag = getSessionTag(session, sessionType);

		return cache(
			unstable_cache(
				async () => (await query({ input: values, db, session })) ?? null,
				[fullTag, sessionTag],
				{ tags: [queryTag, fullTag, sessionTag] }
			)
		)() as never;
	};

export const protectedProcedure = <
	Func extends (args: {
		input: z.infer<Input>;
		db: typeof db;
		session: Exclude<Awaited<ReturnType<typeof getServerAuthSession>>, null>;
	}) => Promise<any>,
	Input extends z.ZodTypeAny = z.ZodUndefined
>({
	input,
	queryKey,
	query,
	sessionType
}: {
	input?: Input;
	queryKey?: string;
	query: Func;
	sessionType?: SessionTagType;
}): ((val: z.infer<Input>) => ReturnType<Func>) =>
	publicProcedure({
		input,
		queryKey,
		query: async args => {
			const session = args.session ?? (await getServerAuthSession());
			if (!session) throw new Error('UNAUTHORIZED');
			return query({ ...args, session }) as never;
		},
		sessionType: sessionType ?? 'any'
	}) as never;

export const adminProcedure = <
	Func extends (args: {
		input: z.infer<Input>;
		db: typeof db;
		session: Exclude<Awaited<ReturnType<typeof getServerAuthSession>>, null>;
	}) => Promise<any>,
	Input extends z.ZodTypeAny = z.ZodUndefined
>({
	input,
	queryKey,
	query,
	sessionType
}: {
	input?: Input;
	queryKey?: string;
	query: Func;
	sessionType?: SessionTagType;
}): ((val: z.infer<Input>) => ReturnType<Func>) =>
	publicProcedure({
		input,
		queryKey,
		query: async args => {
			const session = args.session ?? (await getServerAuthSession());
			if (!session?.user.isAdmin) throw new Error('UNAUTHORIZED');
			return query({ ...args, session }) as never;
		},
		sessionType: sessionType ?? 'role'
	}) as never;
