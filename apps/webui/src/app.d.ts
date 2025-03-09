// See https://kit.svelte.dev/docs/types#app
import type { Cookies } from '@sveltejs/kit';
import { KVNamespace, DurableObjectNamespace } from '@cloudflare/workers-types';
import type { Kysely } from 'kysely';
import type { Database } from '@lyku/db-config/kysely';

declare global {
	namespace App {
		interface Locals {
			cookies: Cookies;
			db?: Kysely<Database>;
		}
		// interface PageData {}
		// interface Error {}
		// interface Platform {}
	}
}

export {};
