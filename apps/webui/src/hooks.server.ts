import { setCookieAdapter } from 'monolith-ts-api';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.cookies = event.cookies;
	// Set up server-side adapter
	setCookieAdapter({
		get: (name: string) => event.cookies.get(name),
		set: (name: string, value: string, options?: { expires?: number }) =>
			event.cookies.set(name, value, {
				path: '/', // Add required path
				...(options?.expires ? { maxAge: options.expires * 24 * 60 * 60 } : {}),
			}),
	});

	// Get language from cookie or accept-language header
	const lang =
		event.cookies.get('lang') ||
		event.request.headers.get('accept-language')?.split(',')[0] ||
		'en-US';

	// Pass language to client through html data attribute
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang),
	});

	return response;
};
