import { v4 } from 'uuid';
import { z } from 'zod';

export const EmptyTalent = () => ({
	icon: '',
	name: '',
	ranks: null,
	description: '',
	requires: null,
	highlight: false
});

export const EmptyTalentTree = (): TalentFormT => ({
	id: v4(),
	public: false,
	icon: 'inv_misc_questionmark',
	name: 'New talent tree',
	class: 0,
	tree: [...Array(4 * 7).keys()].map(() => EmptyTalent()),
	createdById: null,
	createdBy: null,
	createdAt: null,
	updatedAt: null
});

export const EmptyCalculatorForm = (
	p: Partial<CalculatorFormT>
): CalculatorFormT => ({
	class: p.class ?? 0,
	points: p.points ?? [
		[...Array(4 * 7).keys()].map(() => 0),
		[...Array(4 * 7).keys()].map(() => 0),
		[...Array(4 * 7).keys()].map(() => 0)
	]
});

const Talent = z.preprocess(
	v => ({
		...EmptyTalent(),
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		...(v as any)
	}),
	z.object({
		icon: z.string(),
		name: z.string(),
		ranks: z.preprocess(val => (!val ? null : val), z.number().nullable()),
		description: z.string(),
		requires: z.number().nullable(),
		highlight: z.boolean()
	})
);
export type TalentT = z.infer<typeof Talent>;

const TalentTree = z.array(Talent.default(EmptyTalent())).length(4 * 7);
export type TalentTreeT = z.infer<typeof TalentTree>;

export const TalentForm = z.object({
	id: z.string(),
	public: z.boolean().default(false),
	icon: z.string().default(''),
	name: z.string().default(''),
	class: z.number().default(0),
	tree: TalentTree,
	createdById: z.string().nullable().default(null),
	createdBy: z
		.object({ name: z.string().nullable(), image: z.string().nullable() })
		.nullable()
		.default(null),
	createdAt: z.coerce.date().nullable().default(null),
	updatedAt: z.coerce.date().nullable().default(null)
});
export type TalentFormT = z.infer<typeof TalentForm>;

export const Filters = z.object({
	name: z.string().default(''),
	from: z.string().default(''),
	class: z.coerce.number().default(0)
});
export type FiltersT = z.infer<typeof Filters>;

export const CalculatorParams = z.object({
	t0: z.string().default(''),
	t1: z.string().default(''),
	t2: z.string().default(''),
	t: z
		.string()
		.regex(/^\d*-\d*-\d*$/)
		.optional(),
	c: z.coerce.number().default(0)
});

export type CalculatorParamsT = z.infer<typeof CalculatorParams>;

export const CalculatorForm = z.object({
	class: z.coerce.number().default(0),
	points: z.tuple([
		z.array(z.number()).length(4 * 7),
		z.array(z.number()).length(4 * 7),
		z.array(z.number()).length(4 * 7)
	])
});
export type CalculatorFormT = z.infer<typeof CalculatorForm>;
