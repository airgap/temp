import type { AchievementGrant } from '@lyku/json-models';
import { SvelteMap } from 'svelte/reactivity';

export const achievementGrantStore = new SvelteMap<bigint, AchievementGrant>();
