import { type FieldValues, type Resolver } from 'react-hook-form';
import { zodResolver as resolver } from '@hookform/resolvers/zod';
import { toPng } from 'html-to-image';
import pino, { type Logger } from 'pino';
import { type z } from 'zod';

import iconListRaw from '#assets/icon-list.json';
import { type Talents } from '#server/schemas.ts';

import { Errors, isErrors } from './errors';

export const zodResolver = <In extends FieldValues, Out extends FieldValues>(
	schema: z.ZodType<In, z.ZodTypeDef, Out>
): Resolver<z.infer<z.ZodType<In, z.ZodTypeDef, Out>>> => resolver(schema);

export const nullableInput = {
	setValueAs: (v: unknown) => (v === '' ? null : v)
};

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
	const plural = (n: number) => (n === 1 ? '' : 's');
	if (days >= 365) return 'Over a year ago';
	if (days >= 30) {
		const months = Math.floor(days / 30);
		return `${months} month${plural(months)} ago`;
	}
	if (days > 0) return `${days} day${plural(days)} ago`;
	const hours = Math.floor(diff / (1000 * 60 * 60));
	if (hours > 0) return `${hours} hour${plural(hours)} ago`;
	const minutes = Math.floor(diff / (1000 * 60));
	if (minutes > 0) return `${minutes} minute${plural(minutes)} ago`;
	return `<1 minute ago`;
};

export const getTalentSum = (talentTree: Talents, rows: number) =>
	Object.entries(talentTree).reduce(
		(p, [i, n]) => (Number(i) >= rows * 4 ? p : p + (n?.ranks ?? 0)),
		0
	);

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

export const iconList = iconListRaw as Record<string, number>;
const iconCache = new Map<string, string>();

const wowheadIconUrl = (name: string) =>
	`https://wow.zamimg.com/images/wow/icons/large/${name.toLocaleLowerCase()}.jpg`;

export const getIconPath = (icon?: string | null, baseUrl = '') => {
	if (!icon) return wowheadIconUrl('inv_misc_questionmark');
	if (iconCache.has(icon)) return iconCache.get(icon)!;
	if (icon.startsWith('http')) return icon;
	const key = icon.toLocaleLowerCase().replace(/^_/, '');
	const url =
		iconList[key] === 1 ? `${baseUrl}/icons/${key}.png` : wowheadIconUrl(key);
	iconCache.set(icon, url);
	return url;
};

export const elementToPng = async (element: HTMLElement, name: string) => {
	const dataUrl = await toPng(element, {
		backgroundColor: 'transparent'
	});
	const link = document.createElement('a');
	link.download = `${name}.png`;
	link.href = dataUrl;
	link.click();
};

export const safeJsonParse = <T extends z.ZodTypeAny>({
	text,
	schema,
	errorMessage: message
}: {
	text: string;
	schema: T;
	errorMessage?: string;
}) => {
	try {
		const json = JSON.parse(text);
		const parsed = schema.safeParse(json);
		if (!parsed.success)
			throw Errors.schemaValidation({
				message,
				error: parsed.error,
				data: json
			});
		return parsed.data as z.infer<T>;
	} catch (err) {
		throw isErrors(err) ? err : Errors.jsonParse({ message, data: text });
	}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const invoke = <T extends Promise<any>>(value: T) =>
	value.then<Awaited<T>>(res => {
		if (res && '__functionError' in res) throw res.__functionError;
		return res;
	});

const createLogger = (): Logger => {
	if (typeof window !== 'undefined') {
		return pino({
			browser: { transmit: { level: 'info', send: () => {} } },
			level: 'info'
		});
	}
	return pino({
		level: 'info',
		transport:
			process.env.NODE_ENV === 'development'
				? { target: 'pino-pretty', options: { colorize: true } }
				: undefined
	});
};
export const logger = createLogger();
