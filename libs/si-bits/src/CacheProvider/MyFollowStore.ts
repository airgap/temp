import { SvelteMap } from 'svelte/reactivity';

export const myFollowerStore = new SvelteMap<bigint, boolean>();
export const myFolloweeStore = new SvelteMap<bigint, boolean>();
