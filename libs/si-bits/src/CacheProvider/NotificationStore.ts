import type { Notification } from '@lyku/json-models';
import { SvelteMap } from 'svelte/reactivity';

// Create a singleton instance
export const notificationStore = new SvelteMap<bigint, Notification>();
