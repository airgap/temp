import { writable, derived, type Writable } from 'svelte/store';
import type { User } from '@lyku/json-models';
import { sessionId } from 'monolith-ts-api';

// Initialize the store with data from localStorage
const storedUser = localStorage.getItem('currentUser');
const initialUser: User | undefined = storedUser
	? JSON.parse(storedUser)
	: undefined;

// Create the base store
const currentUserStore: Writable<User | undefined> = writable(initialUser);

// Export the store getter/setter functions
export const getCurrentUser = () => {
	let currentValue: User | undefined;
	currentUserStore.subscribe((value) => {
		currentValue = value;
	})();
	return currentValue;
};

export const setCurrentUser = (user?: User) => {
	if (user) {
		localStorage.setItem('currentUser', JSON.stringify(user));
	} else {
		localStorage.removeItem('currentUser');
	}
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
	}
);
