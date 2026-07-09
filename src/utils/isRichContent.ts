import { type InferSelectModel } from 'drizzle-orm';

import { type talentTrees, type collections } from '#server/db/schema.ts';

const normalizeText = (value: string | null | undefined) =>
	(value ?? '')
		.replace(/[#>*_`~-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

export const isRichTreeContent = (
	{
		notes,
		talents
	}: Pick<InferSelectModel<typeof talentTrees>, 'notes' | 'talents'>,
	minLength = 5000
) => {
	const normalizedNotes = normalizeText(notes);
	const normalizedDescriptions = normalizeText(
		Object.values(talents)
			.map(entry => normalizeText(entry?.description))
			.filter(Boolean)
			.join(' ')
	);
	return (
		`${normalizedNotes} ${normalizedDescriptions}`.trim().length >= minLength
	);
};

export const isRichCollectionContent = (
	{
		assignedTrees
	}: Pick<InferSelectModel<typeof collections>, 'assignedTrees'>,
	requiredAssignedTrees = 9
) => {
	if (!assignedTrees) return false;

	const filledUniqueTreeIds = new Set(
		Object.values(assignedTrees).filter(
			(value): value is string => typeof value === 'string' && value.length > 0
		)
	);

	return filledUniqueTreeIds.size >= requiredAssignedTrees;
};
