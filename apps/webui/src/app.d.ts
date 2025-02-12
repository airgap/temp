// See https://kit.svelte.dev/docs/types#app
import type { Cookies } from '@sveltejs/kit';

declare global {
	namespace App {
		interface Locals {
			cookies: Cookies;
		}
		// interface PageData {}
		// interface Error {}
		// interface Platform {}
	}
}

export {};
