import { type Resolver, type FieldValues } from 'react-hook-form';
import type { z } from 'zod';
import { encode, decode } from 'js-base64';

import { TalentFormT } from './App';

export const zodResolver =
	<T extends FieldValues>(
		schema: z.ZodType<T>
	): Resolver<z.infer<z.ZodType<T>>> =>
	async values => {
		const result = await schema.safeParseAsync(values);
		return {
			values: result.success ? result.data : {},
			errors: result.success ? {} : result.error
		};
	};

export const compressTree = (form: TalentFormT) =>
	encode(JSON.stringify(form), true);

export const decompressTree = (tree: string): TalentFormT =>
	JSON.parse(decode(tree));
