// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
	site: 'https://codariolabs.com',
	integrations: [
		react(),
		tailwind({
			config: './tailwind.config.mjs',
			applyBaseStyles: false,
		}),
	],
	output: 'static',
});
