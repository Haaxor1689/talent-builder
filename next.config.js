import './src/env.js';

/** @type {import("next").NextConfig} */
const config = {
	cacheComponents: true,
	reactCompiler: true,
	redirects: () => [
		{
			source: '/c/:slug*',
			destination: '/collections/:slug*',
			permanent: true
		}
	]
};

export default config;
