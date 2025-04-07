import { writable } from 'svelte/store';
import { api } from 'monolith-ts-api';
import { serialize as gSerialize, deserialize as gDeserialize } from '../utils';
import type { User } from '@lyku/json-models';

// Detect if we're running in SSR mode
const isSSR = typeof window === 'undefined';

/**
 * Creates a Svelte store for the current user that automatically fetches the user
 * when needed. Supports both client-side and SSR.
 */
export function createCurrentUserStore() {
	// Store the current user
	const internalStore = writable<User | undefined>(undefined);

	// Track pending request to avoid duplicate fetches
	const pendingRequestStore = writable<Promise<User | undefined> | null>(null);

	// For SSR, we need to track all promises to wait for them to resolve
	const ssrPromises: Promise<any>[] = [];

	// Helper function to safely get the current value of a store
	function getStoreValue<T>(store: {
		subscribe: (callback: (value: T) => void) => any;
	}): T {
		let value: T;
		const unsubscribe = store.subscribe((currentValue) => {
			value = currentValue;
		});
		unsubscribe();
		return value!;
	}

	/**
	 * Get the current user. If not in cache, it will be fetched.
	 * - In client-side: Multiple calls during the same render cycle will be batched.
	 * - In SSR: Data will be fetched immediately and synchronously for the current request.
	 */
	function get(): User | undefined {
		// If we already have the user, return it immediately
		const currentUser = getStoreValue(internalStore);
		if (currentUser !== undefined) {
			return currentUser;
		}

		if (isSSR) {
			// In SSR mode, fetch immediately and synchronously
			const promise = api
				.getCurrentUser()
				.then((user) => {
					if (user) {
						internalStore.set(user);
					}
					return user;
				})
				.catch((error) => {
					console.error('Error fetching current user:', error);
					return undefined;
				});

			// Add to SSR promises to track
			ssrPromises.push(promise);

			// In SSR, we can't return undefined and expect a re-render,
			// so we need to handle this differently in the component
			return undefined;
		} else {
			// Client-side logic
			const pendingRequest = getStoreValue(pendingRequestStore);
			if (pendingRequest === null) {
				const promise = api
					.getCurrentUser()
					.then((user) => {
						if (user) {
							internalStore.set(user);
						}
						pendingRequestStore.set(null);
						return user;
					})
					.catch((error) => {
						console.error('Error fetching current user:', error);
						pendingRequestStore.set(null);
						return undefined;
					});

				pendingRequestStore.set(promise);
			}

			// Return undefined for now, the component will re-render when the data arrives
			return undefined;
		}
	}

	/**
	 * Update the current user in the store
	 */
	function update(user: User) {
		internalStore.set(user);
	}

	/**
	 * Clear the current user from the store
	 */
	function clear() {
		internalStore.set(undefined);
		pendingRequestStore.set(null);
	}

	/**
	 * Preload the store with the current user (useful for SSR hydration)
	 */
	function preload(user: User) {
		internalStore.set(user);
		console.log('Preloaded', user);
	}

	/**
	 * Wait for all pending SSR requests to complete
	 * This should be called before rendering the page in SSR
	 */
	async function awaitSSR(): Promise<void> {
		if (ssrPromises.length > 0) {
			await Promise.all(ssrPromises);
			// Clear the promises array after they're resolved
			ssrPromises.length = 0;
		}
	}

	/**
	 * Serialize the store data for SSR hydration
	 */
	function serialize(): string {
		const user = getStoreValue(internalStore);
		return gSerialize(user);
	}

	/**
	 * Hydrate the store from serialized data
	 */
	function hydrate(serializedData: string) {
		try {
			const userData = gDeserialize(serializedData) as User;
			preload(userData);
		} catch (error) {
			console.error('Error hydrating current user store:', error);
		}
	}

	return {
		get,
		update,
		clear,
		preload,
		awaitSSR,
		serialize,
		hydrate,
		subscribe: internalStore.subscribe,
		// For debugging
		_getStore: () => getStoreValue(internalStore),
		_getPendingRequest: () => getStoreValue(pendingRequestStore),
	};
}

// Create a singleton instance
export const currentUserStore = createCurrentUserStore();
