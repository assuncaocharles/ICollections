import { defineConfig, type ViteUserConfig } from 'vitest/config';

const config: ViteUserConfig = defineConfig({
	test: {
		include: ['src/**/*.test.ts', 'scripts/**/*.test.js', 'site/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			include: ['src/**/*.ts'],
			exclude: ['src/**/*.test.ts', 'src/index.ts'],
			thresholds: { lines: 95, functions: 95, branches: 90, statements: 95 },
		},
	},
});

export default config;
