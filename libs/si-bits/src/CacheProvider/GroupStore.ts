import type { Group } from '@lyku/json-models';
import { SvelteMap } from 'svelte/reactivity';

// Create a singleton instance
export const groupStore = new SvelteMap<bigint, Group>();
