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

type ProcedureReturn<
	SessionType,
	Func extends ProcedureFn<Input, SessionType>,
	Input extends InputType
> =
	z.infer<Input> extends undefined
		? () => Promise<Awaited<ReturnType<Func>>>
		: (val: z.infer<Input>) => Promise<Awaited<ReturnType<Func>>>;

type QueryProps<
	SessionType,
	Func extends ProcedureFn<Input, SessionType>,
	Input extends InputType
> = {
	input?: Input;
	session?: () => SessionType;
	query: Func;
};

export const serverFunction = <
	SessionType,
	Func extends ProcedureFn<Input, SessionType>,
	Input extends InputType = z.ZodUndefined
>({
	input,
	session,
	query
}: QueryProps<SessionType, Func, Input>) =>
	(async (val: z.infer<Input>) => {
		const s = session ? await session() : null;
		const value = input?.parse(val);
		// TODO: Error handling
		return query(value, s as never);
	}) as ProcedureReturn<SessionType, Func, Input>;

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
					headers: Object.fromEntries(req.headers)
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
