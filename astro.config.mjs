// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
	site: 'https://www.codariolabs.com',
	integrations: [
		react(),
		tailwind({
			applyBaseStyles: false,
		}),
		sitemap(),
	],
	output: 'static',
	vite: {
		server: {
			allowedHosts: ['5a54c8bf4e36.ngrok-free.app'],
		},
	},
});
