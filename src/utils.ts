import { type Resolver, type FieldValues } from 'react-hook-form';
import type { z } from 'zod';
import { zodResolver as resolver } from '@hookform/resolvers/zod';
import { isEqual } from 'lodash-es';
import { PlusCircle, Workflow } from 'lucide-react';

import { type TalentFormT, type TalentTreeT } from '~/server/api/types';

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

export const getLastUpdatedString = (date: Date) => {
	if (!date) return 'Never';
	const now = new Date();
	const diff = now.getTime() - new Date(date).getTime();
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor(diff / (1000 * 60));
	const plural = (n: number) => (n === 1 ? '' : 's');
	if (days > 0) return `${days} day${plural(days)} ago`;
	if (hours > 0) return `${hours} hour${plural(hours)} ago`;
	if (minutes > 0) return `${minutes} minute${plural(minutes)} ago`;
	return `<1 minute ago`;
};

export const getTalentSum = (talentTree: TalentTreeT) =>
	talentTree.reduce((p, n) => p + ((n?.ranks ?? 0) || 0), 0);

export const isEmptyTalent = (talent?: TalentFormT['talents'][number]) =>
	!talent ||
	isEqual(talent, {}) ||
	(!talent.name && !talent.description && !talent.ranks);

export const classMask = {
	1: { name: 'Warrior', icon: 'class_warrior', color: '#C79C6E' },
	2: { name: 'Paladin', icon: 'class_paladin', color: '#F58CBA' },
	4: { name: 'Hunter', icon: 'class_hunter', color: '#ABD473' },
	8: { name: 'Rogue', icon: 'class_rogue', color: '#FFF569' },
	16: { name: 'Priest', icon: 'class_priest', color: '#FFFFFF' },
	64: { name: 'Shaman', icon: 'class_shaman', color: '#0070DE' },
	128: { name: 'Mage', icon: 'class_mage', color: '#40C7EB' },
	256: { name: 'Warlock', icon: 'class_warlock', color: '#8787ED' },
	1024: { name: 'Druid', icon: 'class_druid', color: '#FF7D0A' }
} as const;

export const maskToClass = (mask?: number) =>
	classMask[mask as never] as
		| (typeof classMask)[keyof typeof classMask]
		| undefined;

export const topNavigation = [
	{ href: '/tree/new', icon: PlusCircle, text: 'New tree' },
	{ href: '/calculator', icon: Workflow, text: 'Calculator' }
] as const;

export const getIconPath = (icon?: string) =>
	icon?.startsWith('_')
		? `/api/wowhead-icons/${icon.toLocaleLowerCase()}`
		: // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		  `/icons/${(icon || 'inv_misc_questionmark').toLocaleLowerCase()}.png`;
