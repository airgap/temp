import type { Leaderboard } from '@lyku/json-models';
import { SvelteMap } from 'svelte/reactivity';

// Create a singleton instance
export const leaderboardStore = new SvelteMap<bigint, Leaderboard>();
