import type { User } from '@lyku/json-models';
import { SvelteMap } from 'svelte/reactivity';
import { users } from '@lyku/stock-docs';

export const userStore = new SvelteMap<bigint, User>();
userStore.set(-2n, users.deleted);
export const me = () => userStore.get(-1n);
