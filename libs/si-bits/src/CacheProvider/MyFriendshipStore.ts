import type { FriendshipStatus } from 'dist/libs/json-models/src';
import { SvelteMap } from 'svelte/reactivity';

export const myFriendshipStore = new SvelteMap<bigint, FriendshipStatus>();
