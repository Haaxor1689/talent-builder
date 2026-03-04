/* eslint-disable @typescript-eslint/no-explicit-any */
import { cache } from 'react';
// TODO: Replace with use cache
import { unstable_cache } from 'next/cache';
import { z } from 'zod';

import { getSession } from '#auth/server.ts';
import { db } from '#server/db/index.ts';

type SessionTagType = 'user' | 'role' | 'any';

const getSessionTag = (
	session: Awaited<ReturnType<typeof getSession>>,
	sessionType?: SessionTagType
) =>
	`session:[${
		sessionType === 'any'
			? !!session
			: sessionType === 'user'
				? (session?.user?.id ?? 'none')
				: sessionType === 'role'
					? session?.user.role
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
			session: Awaited<ReturnType<typeof getSession>>;
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
		const session = !sessionType ? null : await getSession();

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
		session: Exclude<Awaited<ReturnType<typeof getSession>>, null>;
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
			const session = args.session ?? (await getSession());
			if (!session) throw new Error('UNAUTHORIZED');
			return query({ ...args, session }) as never;
		},
		sessionType: sessionType ?? 'any'
	}) as never;

export const adminProcedure = <
	Func extends (args: {
		input: z.infer<Input>;
		db: typeof db;
		session: Exclude<Awaited<ReturnType<typeof getSession>>, null>;
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
			const session = args.session ?? (await getSession());
			if (session?.user.role !== 'admin') throw new Error('UNAUTHORIZED');
			return query({ ...args, session }) as never;
		},
		sessionType: sessionType ?? 'role'
	}) as never;

export const createdBySelect = {
	columns: { name: true, image: true, role: true }
} as const;
