/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use client';

import { useLayoutEffect, useState } from 'react';

const source = [
	'anniversary',
	'anomalus',
	'balor',
	'druid',
	'gm',
	'gnarlmoon',
	'grimbatol',
	'hunter',
	'lunatic',
	'northwind',
	'paladin_warlock',
	'priest',
	'rogue_mage',
	'shaman_warrior',
	'sorrowguard'
].map(src => `/bgs/${src}.webp`);

const shuffleArray = <T,>(array: T[]) => {
	// While there remain elements to shuffle.
	for (let i = array.length - 1; i > 0; i--) {
		// Pick a remaining element.
		const randomIndex = Math.floor(Math.random() * i);
		// And swap it with the current element.
		[array[i], array[randomIndex]] = [array[randomIndex]!, array[i]!];
	}

	return array;
};

const fadeDuration = 2000;
const swapDuration = 20000;

const BackgroundImage = ({
	src,
	visible
}: {
	src?: string;
	visible: boolean;
}) =>
	!src ? null : (
		<img
			key={src}
			src={src}
			alt="Background"
			className="min-w-[1024px]transition-all pointer-events-none fixed inset-0 -z-10  w-full"
			style={{
				WebkitMaskImage:
					'linear-gradient(180deg, rgba(0,0,0,1), rgba(0,0,0,0))',
				opacity: visible ? 0.33 : 0,
				transitionDuration: `${fadeDuration}ms`
			}}
		/>
	);

const PageBackground = () => {
	const [transition, setTransition] = useState(false);
	const [images, setImages] = useState<typeof source>([]);

	useLayoutEffect(() => {
		if (typeof window === 'undefined') return;
		setImages(shuffleArray(source));
		const interval = setInterval(() => {
			setTransition(true);
			setTimeout(() => setTransition(false), fadeDuration);
			setImages(images => {
				const [current, next, ...rest] = images;
				return [next!, ...shuffleArray(rest), current!];
			});
		}, swapDuration);
		return () => clearInterval(interval);
	}, []);

	return (
		<>
			<BackgroundImage
				src={transition ? images.at(-1) : images.at(0)}
				visible={!transition}
			/>
			<BackgroundImage
				src={transition ? images.at(0) : images.at(1)}
				visible={transition}
			/>
		</>
	);
};

export default PageBackground;
