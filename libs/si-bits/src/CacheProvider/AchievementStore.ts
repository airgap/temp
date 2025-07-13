import type { Achievement } from '@lyku/json-models';
import { SvelteMap } from 'svelte/reactivity';

export const achievementStore = new SvelteMap<bigint, Achievement>();
