import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import type * as DbSchema from '#server/db/schema.ts';
import { CollectionForm, TalentForm } from '#server/schemas.ts';

const ownerId = '63ecb211-ef62-46a2-8688-06f4e999cfe0';
const now = new Date();

type CollectionInsert = typeof DbSchema.collections.$inferInsert;
type TalentTreeInsert = typeof DbSchema.talentTrees.$inferInsert;
type CollectionTreeInsert = typeof DbSchema.collectionTrees.$inferInsert;

const versions = [
	{
		key: 'forever',
		collectionName: 'Forever',
		collectionIcon: 'logo_forever.webp',
		dataUrl:
			'https://nether.wowhead.com/forever/data/talents-classic?dv=29&db=1790292378'
	},
	{
		key: 'tbc',
		collectionName: '2.4.3',
		collectionIcon: 'logo_tbc.gif',
		dataUrl:
			'https://nether.wowhead.com/tbc/data/talents-classic?dv=29&db=1785232218'
	},
	{
		key: 'wotlk',
		collectionName: '3.3.5',
		collectionIcon: 'logo_wotlk.webp',
		dataUrl:
			'https://nether.wowhead.com/wotlk/data/talents-classic?dv=29&db=1711418938'
	}
] as const;

const classTrees = [
	{ id: 1, trees: [161, 164, 163] },
	{ id: 2, trees: [382, 383, 381] },
	{ id: 4, trees: [361, 363, 362] },
	{ id: 8, trees: [182, 181, 183] },
	{ id: 16, trees: [201, 202, 203] },
	{ id: 32, trees: [398, 399, 400] },
	{ id: 64, trees: [261, 263, 262] },
	{ id: 128, trees: [81, 41, 61] },
	{ id: 256, trees: [302, 303, 301] },
	{ id: 1024, trees: [283, 281, 282] }
];

type SourceTalent = {
	id: number;
	row: number;
	col: number;
	icon: string;
	name?: string;
	ranks: number[];
	descriptions?: Record<string, string>;
	requires: { id: number; qty: number }[];
};

type SourceData = {
	talents: Record<string, Record<string, SourceTalent>>;
	trees: Record<string, { description: string }>;
};

type SpecializationData = {
	names: Record<string, string>;
	icons: Record<string, string>;
};

type SpellInfo = {
	name: string;
	tooltip: string;
};

const findObjectEnd = (text: string, start: number) => {
	let depth = 0;
	let quoted = false;
	let escaped = false;

	for (let i = start; i < text.length; i++) {
		const char = text[i];
		if (quoted) {
			if (escaped) escaped = false;
			else if (char === '\\') escaped = true;
			else if (char === '"') quoted = false;
			continue;
		}
		if (char === '"') quoted = true;
		else if (char === '{') depth++;
		else if (char === '}' && --depth === 0) return i + 1;
	}
	throw new Error('Could not find the end of Wowhead talent data');
};

const parseSourceData = (text: string) => {
	const dataStart = text.indexOf('{');
	if (dataStart === -1)
		throw new Error('Wowhead response did not contain data');
	return JSON.parse(
		text.slice(dataStart, findObjectEnd(text, dataStart))
	) as SourceData;
};

const parsePageData = <T>(text: string, key: string) => {
	const marker = `WH.setPageData("${key}",`;
	const markerIndex = text.indexOf(marker);
	if (markerIndex === -1)
		throw new Error(`Wowhead response did not contain ${key}`);
	const dataStart = text.indexOf('{', markerIndex + marker.length);
	if (dataStart === -1)
		throw new Error(`Wowhead response did not contain data for ${key}`);
	return JSON.parse(text.slice(dataStart, findObjectEnd(text, dataStart))) as T;
};

const stripHtml = (value: string) => {
	let previous: string;
	let current = value;
	do {
		previous = current;
		current = current
			.replace(/<!--[\s\S]*?-->/g, '')
			.replace(
				/<(script|style|svg|iframe|object|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
				''
			)
			.replace(/<br\s*\/?\s*>/gi, '\n')
			.replace(/<\/?(?:p|div|li|tr|td|th|h[1-6]|ul|ol|table)\b[^>]*>/gi, '\n')
			.replace(/<img\b[^>]*\balt=(['"])(.*?)\1[^>]*>/gi, '$2')
			.replace(/<[^>]*>/g, '')
			.replace(/&#x([\da-f]+);/gi, (_, code: string) =>
				String.fromCodePoint(parseInt(code, 16))
			)
			.replace(/&#(\d+);/g, (_, code: string) =>
				String.fromCodePoint(Number(code))
			)
			.replace(/&nbsp;/gi, ' ')
			.replace(/&lt;/gi, '<')
			.replace(/&gt;/gi, '>')
			.replace(/&quot;/gi, '"')
			.replace(/&#39;/gi, "'")
			.replace(/&amp;/gi, '&')
			.replace(/[ \t]+\n/g, '\n')
			.replace(/\n{3,}/g, '\n\n')
			.trim();
	} while (current !== previous);
	return current;
};

const iconUrl = (icon: string) =>
	icon.startsWith('http')
		? icon
		: `https://wow.zamimg.com/images/wow/icons/medium/${icon.toLowerCase()}.jpg`;

const tooltipDescription = (tooltip: string) => {
	const matches = [...tooltip.matchAll(/<div class="q">([\s\S]*?)<\/div>/gi)];
	const descriptions = matches
		.map(([, text]) => stripHtml(text ?? ''))
		.filter(Boolean);
	if (!descriptions.length)
		throw new Error('Wowhead tooltip had no description');
	return descriptions.join('\n');
};

const mergeRankDescriptions = (descriptions: string[]): string => {
	if (!descriptions.length) throw new Error('Talent has no rank descriptions');
	const firstDescription = descriptions[0];
	if (firstDescription === undefined)
		throw new Error('Talent has no rank descriptions');
	if (
		descriptions.length === 1 ||
		descriptions.every(d => d === firstDescription)
	)
		return firstDescription;

	const split = descriptions.map(description => {
		const segments: string[] = [];
		const values: string[] = [];
		const numberPattern = /-?\d(?:\d|,(?=\d{3}))*(?:\.\d+)?/g;
		let cursor = 0;
		for (const match of description.matchAll(numberPattern)) {
			const index = match.index ?? 0;
			segments.push(description.slice(cursor, index));
			values.push(match[0]);
			cursor = index + match[0].length;
		}
		segments.push(description.slice(cursor));
		return { segments, values };
	});

	const first = split[0];
	if (!first) throw new Error('Talent has no rank descriptions');
	if (split.some(current => current.values.length !== first.values.length))
		return descriptions.join('\n\nNext rank:\n');

	const mergedSegments = first.segments.map((_, index) => {
		const variants = split.map(current => current.segments[index]!);
		if (variants.every(segment => segment === variants[0])) return variants[0]!;

		const words = variants.map(segment =>
			segment.match(/[A-Za-z]+|[^A-Za-z]+/g)
		);
		if (words.some(tokens => !tokens || tokens.length !== words[0]?.length))
			return undefined;

		const combined: string[] = [];
		for (let tokenIndex = 0; tokenIndex < words[0]!.length; tokenIndex++) {
			const tokenVariants = words.map(tokens => tokens![tokenIndex]!);
			if (tokenVariants.every(token => token === tokenVariants[0])) {
				combined.push(tokenVariants[0]!);
				continue;
			}

			const singularForms = tokenVariants.map(token =>
				token.endsWith('s') ? token.slice(0, -1) : token
			);
			const hasSingular = tokenVariants.some(token => !token.endsWith('s'));
			const hasPlural = tokenVariants.some(token => token.endsWith('s'));
			if (
				!tokenVariants.every(token => /^[A-Za-z]+$/.test(token)) ||
				!singularForms.every(form => form === singularForms[0]) ||
				!hasSingular ||
				!hasPlural
			)
				return undefined;
			combined.push(`${singularForms[0]}(s)`);
		}
		return combined.join('');
	});
	if (mergedSegments.some(segment => segment === undefined))
		return descriptions.join('\n\nNext rank:\n');

	return mergedSegments.reduce<string>((result, segment, index) => {
		const values = [...new Set(split.map(current => current.values[index]))];
		return `${result}${segment ?? ''}${values.join('/')}`;
	}, '');
};

const loadedVersions = await Promise.all(
	versions.map(async version => {
		const globalDataUrl = version.dataUrl
			.replace('/talents-classic?dv=29&db=', '/global?dv=85&db=')
			.concat('&versionsSig=b87d211ac299c77456068a391bce09b1');
		const [sourceResponse, specializationResponse] = await Promise.all([
			fetch(version.dataUrl),
			fetch(globalDataUrl)
		]);
		if (!sourceResponse.ok)
			throw new Error(
				`Wowhead returned HTTP ${sourceResponse.status} for ${version.key} talents`
			);
		if (!specializationResponse.ok)
			throw new Error(
				`Wowhead returned HTTP ${specializationResponse.status} for ${version.key} specialization metadata`
			);
		const [sourceText, specializationText] = await Promise.all([
			sourceResponse.text(),
			specializationResponse.text()
		]);
		return {
			version,
			source: parseSourceData(sourceText),
			specializations: {
				names: parsePageData<Record<string, string>>(
					specializationText,
					'wow.playerClass.specialization.names'
				),
				icons: parsePageData<Record<string, string>>(
					specializationText,
					'wow.playerClass.specialization.icons'
				)
			} satisfies SpecializationData
		};
	})
);

const loadSpellDetails = async (
	version: string,
	source: SourceData
): Promise<Map<number, SpellInfo>> => {
	const spellIds = [
		...new Set(
			Object.values(source.talents)
				.flatMap(tree => Object.values(tree))
				.flatMap(talent => talent.ranks)
		)
	];
	const details = new Map<number, SpellInfo>();
	let cursor = 0;
	const worker = async () => {
		while (cursor < spellIds.length) {
			const spellId = spellIds[cursor++];
			if (spellId === undefined) continue;
			const url = `https://nether.wowhead.com/${version}/tooltip/spell/${spellId}`;
			let lastError: unknown;
			for (let attempt = 0; attempt < 4; attempt++) {
				try {
					const response = await fetch(url);
					if (response.status === 429 || response.status >= 500) {
						lastError = new Error(`Wowhead returned HTTP ${response.status}`);
						await delay(250 * 2 ** attempt);
						continue;
					}
					if (!response.ok)
						throw new Error(
							`Wowhead returned HTTP ${response.status} for ${version} spell ${spellId}`
						);
					const spell = (await response.json()) as SpellInfo;
					if (!spell.name || !spell.tooltip)
						throw new Error(
							`Wowhead returned incomplete data for ${version} spell ${spellId}`
						);
					details.set(spellId, spell);
					lastError = undefined;
					break;
				} catch (err) {
					lastError = err;
					if (attempt < 3) await delay(250 * 2 ** attempt);
				}
			}
			if (lastError)
				throw new Error(`Failed to load ${version} spell ${spellId}`, {
					cause: lastError
				});
		}
	};
	await Promise.all(
		Array.from({ length: Math.min(12, spellIds.length) }, () => worker())
	);
	return details;
};

const spellDetailsByVersion = new Map<string, Map<number, SpellInfo>>();
for (const { version, source } of loadedVersions) {
	if (version.key === 'forever') continue;
	const details = await loadSpellDetails(version.key, source);
	spellDetailsByVersion.set(version.key, details);
	console.log(`Loaded ${details.size} spell ranks for ${version.key}`);
}

const collectionRows: CollectionInsert[] = [];
const treeRows: TalentTreeInsert[] = [];
const joinRows: CollectionTreeInsert[] = [];
const totalTrees: Record<string, number> = {};
const totalTalents: Record<string, number> = {};

for (const { version, source } of loadedVersions) {
	const assignedTrees: Record<string, string> = {};
	let talentCount = 0;
	const spellDetails = spellDetailsByVersion.get(version.key);
	const specializations = loadedVersions.find(
		loaded => loaded.version.key === version.key
	)?.specializations;

	for (const classInfo of classTrees) {
		for (const [tab, sourceTreeId] of classInfo.trees.entries()) {
			const sourceTree = source.trees[String(sourceTreeId)];
			const sourceTalents = source.talents[String(sourceTreeId)];
			if (!sourceTree && !sourceTalents) continue;
			if (!sourceTree || !sourceTalents)
				throw new Error(
					`Incomplete source tree ${sourceTreeId} for ${version.key}`
				);
			const treeName = specializations?.names[String(sourceTreeId)];
			const treeIcon = specializations?.icons[String(sourceTreeId)];
			if (!treeName || !treeIcon)
				throw new Error(
					`Missing ${version.key} specialization metadata for tree ${sourceTreeId}`
				);

			const entries = Object.values(sourceTalents);
			const lastRow = Math.max(...entries.map(talent => talent.row));
			const indexById = new Map(
				entries.map(talent => [talent.id, talent.row * 4 + talent.col])
			);
			const talents: TalentTreeInsert['talents'] = {};

			for (const talent of entries) {
				const fail = (reason: string) =>
					new Error(
						`${version.key} ${sourceTree.description} ${talent.name ?? talent.id}: ${reason}`
					);
				if (talent.ranks.length > 7)
					throw fail("exceeds the app's 7-rank limit");
				if (talent.requires.length > 1)
					throw fail('has unsupported prerequisite alternatives');

				const requirement = talent.requires[0];
				const prerequisiteIndex = requirement
					? indexById.get(requirement.id)
					: undefined;
				if (requirement && prerequisiteIndex === undefined)
					throw fail('references a missing prerequisite');
				const requires = prerequisiteIndex ?? null;
				if (
					requirement &&
					sourceTalents[String(requirement.id)]?.ranks.length !==
						requirement.qty
				)
					throw fail('has an unsupported prerequisite threshold');

				const descriptions =
					version.key === 'forever'
						? Object.entries(talent.descriptions ?? {})
								.toSorted(([lhs], [rhs]) => Number(lhs) - Number(rhs))
								.map(([, description]) => stripHtml(description))
						: talent.ranks.map(spellId => {
								const spell = spellDetails?.get(spellId);
								if (!spell)
									throw fail(`has no description for spell ${spellId}`);
								return tooltipDescription(spell.tooltip);
							});
				if (descriptions.length !== talent.ranks.length)
					throw fail('has incomplete rank descriptions');
				const name =
					version.key === 'forever'
						? talent.name
						: spellDetails?.get(talent.ranks[0] ?? -1)?.name;
				if (!name) throw fail('has no spell name');

				talents[String(talent.row * 4 + talent.col)] = {
					icon: iconUrl(talent.icon),
					name,
					ranks: talent.ranks.length,
					highlight: false,
					description: mergeRankDescriptions(descriptions),
					notes: null,
					requires,
					spellIds: talent.ranks.join(',')
				};
				talentCount++;
			}

			const treeId = `${version.key}-${classInfo.id}-${sourceTreeId}`;
			assignedTrees[`${classInfo.id}:${tab}`] = treeId;
			joinRows.push({ collectionId: version.key, treeId });
			treeRows.push({
				id: treeId,
				name: treeName,
				slug: null,
				visibility: 'public',
				notes: null,
				class: classInfo.id,
				index: 0,
				icon: iconUrl(treeIcon),
				rows: lastRow + 1,
				talents,
				collection: null,
				createdById: ownerId,
				createdAt: now,
				updatedAt: now
			});
		}
	}

	totalTrees[version.key] = Object.keys(assignedTrees).length;
	totalTalents[version.key] = talentCount;
	collectionRows.push({
		id: version.key,
		name: version.collectionName,
		slug: version.collectionName.toLocaleLowerCase(),
		visibility: 'public',
		notes: null,
		icon: `https://www.talent-builder.dev/${version.collectionIcon}`,
		assignedTrees,
		classNotes: {},
		createdById: ownerId,
		createdAt: now,
		updatedAt: now
	});
}

for (const row of collectionRows) {
	const parsed = CollectionForm.safeParse(row);
	if (!parsed.success)
		throw new Error(
			`Invalid collection row ${row.id}: ${parsed.error.message}`
		);
}
for (const row of treeRows) {
	const parsed = TalentForm.safeParse(row);
	if (!parsed.success)
		throw new Error(
			`Invalid talent tree row ${row.id}: ${parsed.error.message}`
		);
}

const args = process.argv.slice(2);
const allowedArgs = new Set(['--dry-run', '--apply']);
const unknownArgs = args.filter(arg => !allowedArgs.has(arg));
if (unknownArgs.length)
	throw new Error(`Unknown argument(s): ${unknownArgs.join(', ')}`);
if (args.includes('--dry-run') && args.includes('--apply'))
	throw new Error('Choose either --dry-run or --apply, not both');

if (!args.includes('--apply')) {
	const outputPath = resolve(process.cwd(), 'data/wowhead-import-dry-run.json');
	const output = {
		format: 'talent-builder.database-import.v1',
		mode: 'dry-run',
		ownerId,
		sources: versions.map(({ key, dataUrl, collectionName }) => ({
			key,
			collectionName,
			dataUrl
		})),
		tables: {
			collection: collectionRows,
			talentTree: treeRows,
			collectionTree: joinRows
		}
	};
	await mkdir(dirname(outputPath), { recursive: true });
	await writeFile(outputPath, `${JSON.stringify(output, null, '\t')}\n`);
	console.log(
		`Dry-run import JSON written to ${outputPath}; no database module was loaded and no database writes were made.`
	);
	process.exit(0);
}

const [{ db }, schema, { eq, inArray, sql }] = await Promise.all([
	import('#server/db/index.ts'),
	import('#server/db/schema.ts'),
	import('drizzle-orm')
]);

await db.transaction(async tx => {
	const owner = await tx
		.select({ id: schema.user.id })
		.from(schema.user)
		.where(eq(schema.user.id, ownerId))
		.limit(1);
	if (!owner.length) throw new Error(`Database user ${ownerId} does not exist`);

	const existingSlugs = await tx
		.select({ id: schema.collections.id, slug: schema.collections.slug })
		.from(schema.collections)
		.where(
			inArray(
				schema.collections.slug,
				collectionRows
					.map(row => row.slug)
					.filter((slug): slug is string => !!slug)
			)
		);
	const conflictingSlugs = existingSlugs.filter(existing =>
		collectionRows.some(
			row => row.slug === existing.slug && row.id !== existing.id
		)
	);
	if (conflictingSlugs.length)
		throw new Error(
			`Collection slug already belongs to another ID: ${conflictingSlugs.map(row => `${row.id} (${row.slug})`).join(', ')}`
		);

	await tx
		.insert(schema.collections)
		.values(collectionRows)
		.onConflictDoUpdate({
			target: schema.collections.id,
			set: {
				name: sql`excluded.name`,
				slug: sql`excluded.slug`,
				visibility: sql`excluded.visibility`,
				notes: sql`excluded.notes`,
				icon: sql`excluded.icon`,
				assignedTrees: sql`excluded.assignedTrees`,
				classNotes: sql`excluded.classNotes`,
				updatedAt: sql`excluded.updatedAt`
			}
		});
	for (let offset = 0; offset < treeRows.length; offset += 20) {
		await tx
			.insert(schema.talentTrees)
			.values(treeRows.slice(offset, offset + 20))
			.onConflictDoUpdate({
				target: schema.talentTrees.id,
				set: {
					name: sql`excluded.name`,
					slug: sql`excluded.slug`,
					visibility: sql`excluded.visibility`,
					notes: sql`excluded.notes`,
					class: sql`excluded.class`,
					index: sql`excluded.index`,
					icon: sql`excluded.icon`,
					rows: sql`excluded.rows`,
					talents: sql`excluded.talents`,
					collection: sql`excluded.collection`,
					updatedAt: sql`excluded.updatedAt`
				}
			});
	}
	for (let offset = 0; offset < joinRows.length; offset += 100) {
		await tx
			.insert(schema.collectionTrees)
			.values(joinRows.slice(offset, offset + 100))
			.onConflictDoNothing();
	}
});

console.log('Import committed successfully.');
