/**
 * This file contains type declarations for server-only modules.
 * It helps TypeScript understand that these modules should never be imported in client code.
 */

// Mark this directory as containing server-only modules
declare module '$lib/server' {
	export const SERVER_ONLY: true;
}

// Mark the database module as server-only
declare module '$lib/server/db' {
	import type { Kysely } from 'kysely';
	import type { Database } from '@lyku/db-types';

	export function initDb(pgConnectionString: string): Kysely<Database>;
	export function getDb(pgConnectionString?: string): Kysely<Database>;
	export function testConnection(): Promise<boolean>;
}
