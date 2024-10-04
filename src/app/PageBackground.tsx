'use client';

import { useEffect, useState } from 'react';

const images = ['anniversary', 'gnarlmoon', 'anomalus', 'druid'];

const PageBackground = () => {
	const [image, setImage] = useState(0);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const interval = setInterval(() => {
			setImage(Math.floor(Math.random() * images.length));
		}, 30000);
		return () => clearInterval(interval);
	}, [image]);

	return (
		<div
			className="pointer-events-none fixed left-1/2 top-0 -z-10 aspect-video w-full min-w-[1024px] -translate-x-1/2 bg-cover bg-top bg-no-repeat opacity-50 transition-all duration-[2000ms]"
			style={{
				backgroundImage: `url("/${images[image]}.webp")`,
				maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0))'
			}}
		/>
	);
};

export default PageBackground;
