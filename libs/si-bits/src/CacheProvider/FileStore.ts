import type { FileDoc } from '@lyku/json-models';
import { SvelteMap } from 'svelte/reactivity';

// Create a singleton instance
export const fileStore = new SvelteMap<bigint, FileDoc>();
