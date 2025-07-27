import type { Score } from '@lyku/json-models';
import { SvelteMap } from 'svelte/reactivity';

export const scoreStore = new SvelteMap<bigint, Score>();
