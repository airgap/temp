import { writable } from 'svelte/store';

export const languageStore = writable<string>('en-US');
