/**
 * Type definitions for the SvelteKit environment plugin
 */
export function svelteKitEnv(): {
	name: string;
	resolveId(id: string): string | null;
	load(id: string): string | null;
};
