import { nanoid } from 'nanoid';
import { z } from 'zod';

export const Talent = z.object({
	icon: z.string().default(''),
	name: z.string().default(''),
	ranks: z.preprocess(
		val => (!val ? null : val),
		z.number().nullable().default(null)
	),
	spellIds: z.string().nullable().default(null),
	description: z.string().default(''),
	requires: z.number().nullable().default(null),
	highlight: z.boolean().default(false)
});
export type TalentT = z.infer<typeof Talent>;

const TalentTree = z.array(Talent.default({})).length(4 * 7);
export type TalentTreeT = z.infer<typeof TalentTree>;

export const TalentForm = z.object({
	id: z.string().default(nanoid(10)),
	public: z.boolean().default(false),
	notes: z.string().nullable().default(null),
	icon: z.string().default('inv_misc_questionmark'),
	name: z.string().default('New talent tree'),
	class: z.number().default(0),
	index: z.number().default(0),
	talents: TalentTree.default(
		[...Array(4 * 7).keys()].map(() => Talent.parse({}))
	),
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
	name: z.string().optional().default(''),
	from: z.string().optional().default(''),
	class: z.coerce.number().optional().default(0)
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
	c: z.coerce.number().optional(),
	tab: z.string().optional()
});

export type CalculatorParamsT = z.infer<typeof CalculatorParams>;

export const BuildForm = z.object({
	id: z.string().default(nanoid(10)),
	name: z.string().default(''),
	class: z.number().default(0),
	points: z
		.tuple([
			z.array(z.number()).length(4 * 7),
			z.array(z.number()).length(4 * 7),
			z.array(z.number()).length(4 * 7)
		])
		.default([
			[...Array(4 * 7).keys()].map(() => 0),
			[...Array(4 * 7).keys()].map(() => 0),
			[...Array(4 * 7).keys()].map(() => 0)
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
