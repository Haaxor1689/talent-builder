import './src/env.js';

/** @type {import("next").NextConfig} */
const config = {
	cacheComponents: true,
	reactCompiler: true,
	experimental: {
		optimizePackageImports: ['lucide-react']
	},
	redirects: () => [
		{
			source: '/tree/:slug*',
			destination: '/trees/:slug*',
			permanent: true
		},
		{
			source: '/local',
			destination: '/trees/local',
			permanent: true
		},
		{
			source: '/c/:slug*',
			destination: '/collections/:slug*',
			permanent: true
		}
	]
};

export default config;
