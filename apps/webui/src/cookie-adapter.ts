import { browser } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';
import { setCookieAdapter } from 'monolith-ts-api';

// Set up client-side adapter using SvelteKit's cookies
setCookieAdapter({
	get: (name: string) => {
		if (!browser) return undefined;
		const match = document.cookie.match(
			new RegExp('(^| )' + name + '=([^;]+)')
		);
		return match ? match[2] : undefined;
	},
	set: (name: string, value: string, options?: { expires?: number }) => {
		if (!browser) return;
		const date = new Date();
		date.setTime(
			date.getTime() + (options?.expires || 0) * 24 * 60 * 60 * 1000
		);
		document.cookie = `${name}=${value}${
			options?.expires ? `;expires=${date.toUTCString()}` : ''
		};path=/`;
	},
});
