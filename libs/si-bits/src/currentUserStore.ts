import { writable, type Writable } from 'svelte/store';
import type { User } from '@lyku/json-models';

// Create the store
const currentUserStore: Writable<User | undefined> = writable(undefined);

// Export a simplified store interface
export const currentUser = {
	...currentUserStore,
	// Add any specific methods you need, for example:
	logout: () => currentUserStore.set(undefined),
};
