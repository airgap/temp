import type { Post } from '@lyku/json-models';
import { SvelteMap } from 'svelte/reactivity';

export const postStore = new SvelteMap<bigint, Post>();
