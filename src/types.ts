import { z } from 'zod';

const Talent = z
	.object({
		icon: z.string(),
		name: z.string(),
		ranks: z.number().min(1).max(5).nullable(),
		description: z.string(),
		requires: z.number().nullable()
	})
	.partial();
export type TalentT = z.infer<typeof Talent>;

const TalentTree = z.array(Talent).length(4 * 7);
export type TalentTreeT = z.infer<typeof TalentTree>;

export const TalentForm = z.object({
	id: z.string(),
	class: z.number(),
	icon: z.string(),
	name: z.string(),
	tree: TalentTree,
	selected: z.number().optional()
});
export type TalentFormT = z.infer<typeof TalentForm>;
