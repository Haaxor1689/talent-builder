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
			source: '/c/:slug*',
			destination: '/collections/:slug*',
			permanent: true
		}
	]
};

export default config;
