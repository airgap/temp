import { writable, derived, type Writable } from 'svelte/store';
import type { User } from '@lyku/json-models';

// Create the base store without localStorage initialization
const currentUserStore: Writable<User | undefined> = writable(undefined);

// Export the store getter/setter functions
export const getCurrentUser = () => {
	let currentValue: User | undefined;
	currentUserStore.subscribe((value) => {
		currentValue = value;
	})();
	return currentValue;
};

export const setCurrentUser = (user?: User) => {
	currentUserStore.set(user);
};

// Export the store itself for Svelte components
export const currentUser = {
	subscribe: currentUserStore.subscribe,
};

// Create a derived store for user status
export const currentUserStatus = derived(
	currentUserStore,
	($currentUser, set) => {
		set({
			user: $currentUser,
			loading: false,
			error: null as Error | null,
		});
	},
	{
		user: undefined as User | undefined,
		loading: true,
		error: null as Error | null,
	},
);
