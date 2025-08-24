import type { GroupMembership } from '@lyku/json-models';
import { SvelteMap } from 'svelte/reactivity';

// Create a singleton instance
export const groupMembershipStore = new SvelteMap<string, GroupMembership>();
