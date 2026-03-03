import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const BLOCKED_UAS = [
	'GPTBot',
	'ChatGPT-User',
	'CCBot',
	'Claude-Web',
	'ClaudeBot',
	'PerplexityBot',
	'Omgilibot',
	'facebookexternalhit',
	'Bytespider'
];

export const config = {
	matcher: ['/((?!_next/|favicon.ico|robots.txt|sitemap.xml).*)']
};

export const proxy = (req: NextRequest) => {
	const ua = req.headers.get('user-agent') ?? '';

	// 1. Block known AI / heavy scrapers by UA
	if (BLOCKED_UAS.some(b => ua.includes(b))) {
		return new NextResponse('Blocked', { status: 403 });
	}

	const res = NextResponse.next();

	// 2. Add AI‑related robot headers globally
	res.headers.set('X-Robots-Tag', 'noai, noimageai');
	res.headers.set('Permissions-Policy', 'interest-cohort=()');

	return res;
};
