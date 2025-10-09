export const SITE_URL = 'https://www.codariolabs.com';
export const DEFAULT_TITLE = 'Codario Labs — Web that launches and scales';
export const DEFAULT_DESCRIPTION =
	'Modern web development for startups and small businesses: landing pages, web apps, and growth retainers.';
export const DEFAULT_IMAGE = '/assets/og.png';
export const THEME_COLOR = '#0A2540';
export const SITE_NAME = 'Codario Labs';

export interface BreadcrumbItem {
	name: string;
	url?: string;
}

export interface SEOProps {
	title?: string;
	description?: string;
	image?: string;
	url?: string;
	noindex?: boolean;
	breadcrumbs?: BreadcrumbItem[];
	type?: string;
}

export const absoluteUrl = (path?: string): string => {
	if (!path) return SITE_URL;
	try {
		return new URL(path, SITE_URL).toString();
	} catch {
		return SITE_URL;
	}
};

export const organizationSchema = {
	'@context': 'https://schema.org',
	'@type': 'Organization',
	name: SITE_NAME,
	url: SITE_URL,
	logo: absoluteUrl('/assets/logo-codario.svg'),
	sameAs: [
		'https://www.linkedin.com/company/codario',
		'https://github.com/codario',
		'https://x.com/codariolabs',
	],
};

export const websiteSchema = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: SITE_NAME,
	url: SITE_URL,
	potentialAction: {
		'@type': 'SearchAction',
		target: `${SITE_URL}/?s={search_term_string}`,
		'query-input': 'required name=search_term_string',
	},
};

export const buildBreadcrumbSchema = (items: BreadcrumbItem[] = []) => {
	if (!items.length) return null;

	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.url ?? '/'),
		})),
	};
};
