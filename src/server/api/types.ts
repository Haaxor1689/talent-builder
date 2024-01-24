import { v4 } from 'uuid';
import { z } from 'zod';

export const EmptyTalent = {
	icon: '',
	name: '',
	ranks: null,
	description: '',
	requires: null,
	highlight: false
};

export const EmptyTalentTree = (): TalentFormT => ({
	id: v4(),
	public: false,
	icon: 'inv_misc_questionmark',
	name: 'New talent tree',
	tree: [...Array(4 * 7).keys()].map(() => EmptyTalent)
});

const Talent = z
	.object({
		icon: z.string(),
		name: z.string(),
		ranks: z.preprocess(
			val => (!val ? null : val),
			z.number().min(1).max(5).nullable()
		),
		description: z.string(),
		requires: z.number().nullable(),
		highlight: z.boolean()
	})
	.partial();
export type TalentT = z.infer<typeof Talent>;

const TalentTree = z.array(Talent.default(EmptyTalent)).length(4 * 7);
export type TalentTreeT = z.infer<typeof TalentTree>;

export const TalentForm = z.object({
	id: z.string(),
	public: z.boolean().default(false),
	icon: z.string().default(''),
	name: z.string().default(''),
	tree: TalentTree
});
export type TalentFormT = z.infer<typeof TalentForm>;
