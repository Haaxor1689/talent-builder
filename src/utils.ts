import { type Resolver, type FieldValues } from 'react-hook-form';
import type { z } from 'zod';
import { zodResolver as resolver } from '@hookform/resolvers/zod';

import { type TalentTreeT } from '~/server/api/types';

export const zodResolver = <In extends FieldValues, Out extends FieldValues>(
	schema: z.ZodType<In, z.ZodTypeDef, Out>
): Resolver<z.infer<z.ZodType<In, z.ZodTypeDef, Out>>> => resolver(schema);

export const downloadBlob = (blob: Blob, title: string) => {
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');

	link.href = url;
	link.download = title;

	link.click();
};

export const getTalentSum = (talentTree: TalentTreeT) =>
	talentTree.reduce((p, n) => p + ((n?.ranks ?? 0) || 0), 0);
