import { setCookieAdapter } from 'monolith-ts-api';
import type { Handle } from '@sveltejs/kit';
import { initDb } from './lib/server/db.server';
import type { Kysely } from 'kysely';
import type { Database } from '@lyku/db-config/kysely';

// Extend the Locals interface to include the database
declare global {
	namespace App {
		interface Locals {
			cookies: import('@sveltejs/kit').Cookies;
			db?: Kysely<Database>;
		}

		interface Platform {
			env?: {
				PG_CONNECTION_STRING?: string;
				[key: string]: string | undefined;
			};
		}
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.cookies = event.cookies;

	// Initialize database if we have platform environment
	if (event.platform?.env?.PG_CONNECTION_STRING) {
		const db = initDb(event.platform.env.PG_CONNECTION_STRING);
		event.locals.db = db;
	}
	console.log('Got db');
	// Set up server-side adapter
	setCookieAdapter({
		get: (name: string) => event.cookies.get(name),
		set: (name: string, value: string, options?: { expires?: number }) =>
			event.cookies.set(name, value, {
				path: '/', // Add required path
				...(options?.expires ? { maxAge: options.expires * 24 * 60 * 60 } : {}),
			}),
	});
	console.log('Set cookie adapter');
	// Get language from cookie or accept-language header
	const lang =
		event.cookies.get('lang') ||
		event.request.headers.get('accept-language')?.split(',')[0] ||
		'en-US';
	console.log('Set lang');
	// Pass language to client through html data attribute
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang),
	});
	console.log('Set response');
	return response;
};
