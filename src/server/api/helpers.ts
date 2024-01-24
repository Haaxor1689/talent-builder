/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';
import { unstable_cache } from 'next/cache';

import { db } from '../db';
import { getServerAuthSession } from '../auth';

export const getTag = (queryKey: string, input: unknown) =>
	`api:[${queryKey}] | input:[${JSON.stringify(input)}]`;

export const publicProcedure =
	<
		Func extends (args: {
			input: z.infer<Input>;
			db: typeof db;
		}) => Promise<any>,
		Input extends z.ZodTypeAny = z.ZodUndefined
	>({
		input,
		queryKey,
		query
	}: {
		input?: Input;
		queryKey?: string;
		query: Func;
	}) =>
	(val: z.infer<Input>): ReturnType<Func> => {
		const values = (input ?? z.undefined()).parse(val);
		if (queryKey) {
			const tag = getTag(queryKey, values);
			return unstable_cache(() => query({ input: values, db }), [tag], {
				tags: [tag]
			})() as never;
		}
		return query({ input: values, db }) as never;
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
	query
}: {
	input?: Input;
	queryKey?: string;
	query: Func;
}): ((val: z.infer<Input>) => ReturnType<Func>) =>
	publicProcedure({
		input,
		queryKey,
		query: async args => {
			const session = await getServerAuthSession();
			if (!session) throw new Error('UNAUTHORIZED');
			return query({ ...args, session }) as never;
		}
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
	query
}: {
	input?: Input;
	queryKey?: string;
	query: Func;
}): ((val: z.infer<Input>) => ReturnType<Func>) =>
	publicProcedure({
		input,
		queryKey,
		query: async args => {
			const session = await getServerAuthSession();
			if (session?.user?.name !== 'Haaxor1689') throw new Error('UNAUTHORIZED');
			return query({ ...args, session }) as never;
		}
	}) as never;
