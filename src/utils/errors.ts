import pino from 'pino';
import { type z } from 'zod';

class AppError<const T extends string, Args> extends Error {
	readonly _type!: T;
	readonly _args!: Args;

	constructor(type: T, args: Args) {
		super(
			JSON.stringify({ type, ...args }, (_, v) =>
				v instanceof Error ? pino.stdSerializers.err(v) : v
			)
		);
		this.name = 'AppError';
	}
}

export const Errors = {
	generic: (args: { message?: string; cause?: unknown }) =>
		new AppError('Generic', args),
	http: (args: {
		message?: string;
		status: number;
		statusText: string;
		text: string;
	}) => new AppError('HTTP Error', args),
	unauthorized: (args: { message?: string }) =>
		new AppError('Unauthorized', args),
	serviceUnavailable: (args: { message?: string }) =>
		new AppError('Service Unavailable', args),
	jsonParse: (args: { message?: string; data?: string }) =>
		new AppError('Invalid JSON', args),
	schemaValidation: (args: {
		message?: string;
		error: z.ZodError;
		data: unknown;
	}) => new AppError('Schema Validation Error', args)
};

type Errors = {
	[K in keyof typeof Errors]: (typeof Errors)[K] extends (
		...args: any
	) => AppError<infer T, infer Args>
		? { type: T } & Args
		: never;
}[keyof typeof Errors];

export const isErrors = (error: unknown): error is Error =>
	error instanceof Error && error.name === 'AppError';

export const getError = (obj: unknown): Errors => {
	const error = isErrors(obj)
		? obj
		: Errors.generic({ message: 'Unhandled exception', cause: obj });
	return JSON.parse(error.message);
};
