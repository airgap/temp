import type { User } from '@lyku/json-models';
import { SvelteMap } from 'svelte/reactivity';

export const userStore = new SvelteMap<bigint, User>();
