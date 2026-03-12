import { nanoid } from 'nanoid';
import { z } from 'zod';

import { bitUnpack, legacyBitUnpack } from '#components/calculator/utils.ts';

import { TreeVisibility, UserRoles } from './db/schema';

export const Talent = z.object({
	icon: z.string().default('inv_misc_questionmark'),
	name: z.string().default('New talent'),
	ranks: z.preprocess(
		val =>
			!val || isNaN(Number(val)) ? 1 : Math.max(Math.min(Number(val), 7), 0),
		z.number().min(0).max(7).default(1)
	),
	highlight: z.boolean().default(false),
	description: z.string().nullable().default(null),
	notes: z.string().nullable().default(null),
	requires: z.number().nullable().default(null),
	spellIds: z.string().nullable().default(null)
});
export type Talent = z.infer<typeof Talent>;

const isEmptyTalent = (t?: Talent) =>
	!t || (!t.name && !t.description && !t.ranks);

const Talents = z.preprocess(
	value => {
		if (!Array.isArray(value)) return value;
		// Migrate from array format to object format
		return Object.fromEntries(
			value
				.map((talent, idx) => [`${idx}`, talent] as const)
				.filter(([, talent]) => !isEmptyTalent(talent))
		);
	},
	z.record(z.string(), Talent.optional())
);
export type Talents = z.infer<typeof Talents>;

export const TalentForm = z.object({
	id: z.string().default(nanoid(10)),
	icon: z.string().default('inv_misc_questionmark'),
	name: z.string().default('New talent tree'),
	class: z.number().default(0),
	index: z.number().default(0),
	rows: z.number().min(1).max(11).default(7),
	talents: Talents.default({}),
	collection: z.string().nullable().default(null),
	visibility: z.enum(TreeVisibility).nullable().default(null),
	notes: z.string().nullable().default(null),
	createdById: z.string().nullable().default(null),
	createdBy: z
		.object({
			name: z.string(),
			image: z.string().nullable(),
			role: z.enum(UserRoles)
		})
		.nullable()
		.default(null),
	createdAt: z.coerce.date().nullable().default(null),
	updatedAt: z.coerce.date().nullable().default(null)
});
export type TalentForm = z.infer<typeof TalentForm>;

export const TreesFilters = z.object({
	name: z.string().optional().default(''),
	from: z.string().optional().default(''),
	class: z.coerce.number().optional().default(0),
	rows: z.coerce.number().optional()
});
export type TreesFilters = z.infer<typeof TreesFilters>;

export const CalculatorParams = z
	.object({
		t0: z.string().optional(),
		t1: z.string().optional(),
		t2: z.string().optional(),
		t: z
			.string()
			.regex(/^\d*-\d*-\d*$/)
			.optional(),
		points: z.string().optional(),
		c: z.coerce.number().optional(),
		class: z.coerce.number().optional(),
		rows: z.coerce.number().optional()
	})
	.transform(val => ({
		t0: val.t0,
		t1: val.t1,
		t2: val.t2,
		points: val.points
			? bitUnpack(val.points)
			: val.t
				? legacyBitUnpack(val.t)
				: undefined,
		class: val.class ?? val.c,
		rows: val.rows
	}));

export type CalculatorParams = z.infer<typeof CalculatorParams>;

export const BuildForm = z.object({
	id: z.string().default(nanoid(10)),
	name: z.string().default(''),
	class: z.number().default(0),
	rows: z.number().min(1).max(11).default(7),
	points: z
		.tuple([z.array(z.number()), z.array(z.number()), z.array(z.number())])
		.default([[], [], []]),
	createdById: z.string().nullable().default(null),
	createdBy: z
		.object({
			name: z.string(),
			image: z.string().nullable(),
			role: z.enum(UserRoles)
		})
		.nullable()
		.default(null),
	createdAt: z.coerce.date().nullable().default(null),
	updatedAt: z.coerce.date().nullable().default(null)
});
export type BuildForm = z.infer<typeof BuildForm>;
