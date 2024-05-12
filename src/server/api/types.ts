import { nanoid } from 'nanoid';
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
	id: nanoid(10),
	public: false,
	icon: 'inv_misc_questionmark',
	name: 'New talent tree',
	notes: null,
	class: 0,
	tree: [...Array(4 * 7).keys()].map(() => EmptyTalent()),
	createdById: null,
	createdBy: null,
	createdAt: null,
	updatedAt: null
});

export const EmptySavedBuild = (): BuildFormT => ({
	id: nanoid(10),
	name: '',
	class: 0,
	points: [
		[...Array(4 * 7).keys()].map(() => 0),
		[...Array(4 * 7).keys()].map(() => 0),
		[...Array(4 * 7).keys()].map(() => 0)
	],
	createdById: null,
	createdBy: null,
	createdAt: null,
	updatedAt: null
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
	notes: z.string().nullable().default(null),
	icon: z.string().default(''),
	name: z.string().default(''),
	class: z.number().default(0),
	tree: TalentTree,
	createdById: z.string().nullable().default(null),
	createdBy: z
		.object({
			name: z.string().nullable(),
			image: z.string().nullable(),
			isAdmin: z.boolean().nullable().default(false)
		})
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
	t0: z.string().optional(),
	t1: z.string().optional(),
	t2: z.string().optional(),
	t: z
		.string()
		.regex(/^\d*-\d*-\d*$/)
		.optional(),
	c: z.coerce.number().optional()
});

export type CalculatorParamsT = z.infer<typeof CalculatorParams>;

export const BuildForm = z.object({
	id: z.string(),
	name: z.string(),
	class: z.number().default(0),
	points: z.tuple([
		z.array(z.number()).length(4 * 7),
		z.array(z.number()).length(4 * 7),
		z.array(z.number()).length(4 * 7)
	]),
	createdById: z.string().nullable().default(null),
	createdBy: z
		.object({
			name: z.string().nullable(),
			image: z.string().nullable(),
			isAdmin: z.boolean().nullable().default(false)
		})
		.nullable()
		.default(null),
	createdAt: z.coerce.date().nullable().default(null),
	updatedAt: z.coerce.date().nullable().default(null)
});
export type BuildFormT = z.infer<typeof BuildForm>;
