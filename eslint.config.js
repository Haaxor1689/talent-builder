import { defineConfig, globalIgnores } from 'eslint/config';
import configNextVitals from 'eslint-config-next/core-web-vitals';
import configNextTypescript from 'eslint-config-next/typescript';
import configPrettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import eslintJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintReact from '@eslint-react/eslint-plugin';

export default defineConfig([
	// TODO: MIgrate
	configPrettier,
	...configNextVitals,
	...configNextTypescript,
	pluginReactHooks.configs.flat['recommended-latest'],
	{
		files: ['**/*.ts', '**/*.tsx'],

		extends: [
			eslintJs.configs.recommended,
			tseslint.configs.recommended,
			eslintReact.configs['recommended-typescript']
		],

		plugins: {
			'import': pluginImport,
			'simple-import-sort': pluginSimpleImportSort
		},

		// Configure language/parsing options
		languageOptions: {
			// Use TypeScript ESLint parser for TypeScript files
			parser: tseslint.parser,
			parserOptions: {
				// Enable project service for better TypeScript integration
				projectService: true,
				tsconfigRootDir: import.meta.dirname
			}
		},

		rules: {
			// General
			'no-template-curly-in-string': ['error'],
			'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
			'no-var': 'error',
			'no-useless-rename': 'error',
			'object-shorthand': ['error', 'always'],
			'comma-dangle': ['error', 'never'],
			'arrow-body-style': ['error', 'as-needed'],
			'eqeqeq': ['error', 'always'],
			'dot-notation': 'error',
			'prefer-arrow-callback': 'error',
			'prefer-const': 'error',
			'prefer-template': 'error',
			// Typescript
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/consistent-type-definitions': ['error', 'type'],
			'@typescript-eslint/prefer-optional-chain': 'error',
			'@typescript-eslint/prefer-nullish-coalescing': ['warn'],
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/consistent-type-imports': [
				'warn',
				{ prefer: 'type-imports', fixStyle: 'inline-type-imports' }
			],
			'@typescript-eslint/no-unused-expressions': [
				'error',
				{ allowShortCircuit: true, allowTernary: true }
			],
			// React
			'react/react-in-jsx-scope': 'off',
			'react/function-component-definition': [
				'error',
				{
					namedComponents: 'arrow-function',
					unnamedComponents: 'arrow-function'
				}
			],
			'react/self-closing-comp': 'error',
			'react/jsx-boolean-value': ['error', 'never'],
			'react/jsx-curly-brace-presence': ['error', 'never'],
			'react/jsx-curly-spacing': ['error', 'never'],
			'react/jsx-equals-spacing': ['error', 'never'],
			'react/jsx-fragments': ['error', 'syntax'],
			'react/jsx-no-useless-fragment': 'error',
			'react/display-name': 'off',
			'@eslint-react/no-array-index-key': 'off',
			// Next.js
			'@next/next/no-img-element': 'off',
			// Import
			'import/first': 'error',
			'import/newline-after-import': 'error',
			'import/no-duplicates': 'error',
			'simple-import-sort/exports': 'error',
			'simple-import-sort/imports': [
				'error',
				{
					groups: [
						// Side effect imports.
						['^\\u0000'],
						// Node.js builtins.
						['^node:'],
						// Packages.
						['^react', '^next', '^@?\\w'],
						// Absolute imports and other imports such as Vue-style `@/foo`.
						['^#'],
						// Relative imports.
						['^\\.'],
						// Style imports.
						['^.+\\.css$']
					]
				}
			]
		}
	},

	globalIgnores([
		// Default ignores of eslint-config-next:
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts'
	])
]);
