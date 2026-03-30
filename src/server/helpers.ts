import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';
import { type z } from 'zod';

import { getError } from '#utils/errors.ts';
import { logger } from '#utils/index.ts';

type InputType = z.AnyZodObject | z.ZodUndefined;

type ProcedureFn<
	Input extends InputType,
	SessionType
> = SessionType extends never
	? (input: z.infer<Input>) => Promise<unknown>
	: (input: z.infer<Input>, session: Awaited<SessionType>) => Promise<unknown>;

export type ProcedureResult<Return> =
	| { ok: true; data: Return }
	| { ok: false; error: unknown };

type ProcedureReturn<
	SessionType,
	Func extends ProcedureFn<Input, SessionType>,
	Input extends InputType,
	Return = Awaited<ReturnType<Func>>
> =
	z.infer<Input> extends undefined
		? () => Promise<ProcedureResult<Return>>
		: (val: z.infer<Input>) => Promise<ProcedureResult<Return>>;

type QueryProps<
	SessionType,
	Func extends ProcedureFn<Input, SessionType>,
	Input extends InputType,
	Return = Awaited<ReturnType<Func>>
> = {
	input?: Input;
	session?: () => SessionType;
	query: Func;
	transform?: (r: Awaited<ReturnType<Func>>) => Promise<Return>;
};

export type ServerFunctionReturn<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Func extends (...args: any[]) => Promise<ProcedureResult<unknown>>
> = Awaited<ReturnType<Func>> extends ProcedureResult<infer R> ? R : never;

export const serverFunction = <
	SessionType,
	Func extends ProcedureFn<Input, SessionType>,
	Input extends InputType = z.ZodUndefined,
	Return = Awaited<ReturnType<Func>>
>({
	input,
	session,
	query,
	transform
}: QueryProps<SessionType, Func, Input, Return>) =>
	(async (val: z.infer<Input>) => {
		try {
			const s = session ? await session() : null;
			const value = input?.parse(val);
			const result = await query(value, s as never);
			return {
				ok: true,
				data: transform ? await transform(result as never) : result
			};
		} catch (err) {
			const error = getError(err);
			logger.error({
				source: 'API function error',
				input: val,
				error
			});
			return { ok: false, error };
		}
	}) as ProcedureReturn<SessionType, Func, Input, Return>;

type RouteInput = Record<string, string | string[]>;

type RouteRequest<Input extends RouteInput> = NextRequest & {
	params: Promise<Input>;
};

type RouteResponse = Promise<Response>;

export const serverRoute =
	<Input extends RouteInput>(cb: (req: RouteRequest<Input>) => RouteResponse) =>
	async (req: NextRequest, { params }: { params: Promise<Input> }) => {
		try {
			return await cb(Object.assign(req, { params }));
		} catch (err) {
			const error = getError(err);
			logger.error({
				source: 'Unhandled API exception',
				context: {
					method: req.method,
					url: req.url,
					headers: Object.fromEntries(req.headers as never)
				},
				error
			});

			if (error.type === 'Unauthorized')
				return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

			if (error.type === 'Service Unavailable')
				return NextResponse.json(
					{ error: 'Deployment in progress' },
					{ status: 503 }
				);

			return NextResponse.json(
				{ error: error.message ?? 'Internal Server Error' },
				{ status: 500 }
			);
		}
	};
