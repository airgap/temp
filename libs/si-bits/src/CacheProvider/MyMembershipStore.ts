import { SvelteSet } from 'svelte/reactivity';

// Create a singleton instance
export const myMembershipStore = new SvelteSet<bigint>();
