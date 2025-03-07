import { writable, derived } from 'svelte/store';
import { api } from 'monolith-ts-api';
import type { User } from '@lyku/json-models';

// Detect if we're running in SSR mode
const isSSR = typeof window === 'undefined';

/**
 * Creates a Svelte store for users that automatically fetches missing users
 * non-redundantly and in batches. Supports both client-side and SSR.
 */
export function createUserStore() {
	// Store all users in a Map
	const usersStore = writable<Map<bigint, User>>(new Map());

	// Track pending requests to avoid duplicate fetches
	const pendingRequestsStore = writable<Map<string, Promise<User[]>>>(
		new Map()
	);

	// Track IDs that need to be fetched in the next batch
	const pendingIdsStore = writable<Set<bigint>>(new Set());

	// Batch size for API requests
	const BATCH_SIZE = 50;

	// Debounce time in milliseconds (only used in client-side)
	const DEBOUNCE_TIME = 50;

	// Timer for batching requests (only used in client-side)
	let batchTimer: ReturnType<typeof setTimeout> | null = null;

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
	 * Get a user by ID. If the user is not in the cache, it will be fetched.
	 * - In client-side: Multiple calls during the same render cycle will be batched.
	 * - In SSR: Data will be fetched immediately and synchronously for the current request.
	 */
	function get(id: bigint): User | undefined {
		// If we already have the user, return it immediately
		const usersMap = getStoreValue(usersStore);
		if (usersMap.has(id)) {
			return usersMap.get(id);
		}

		if (isSSR) {
			// In SSR mode, fetch immediately and synchronously
			const promise = api
				.getUsers([id])
				.then(([user]) => {
					if (user) {
						usersStore.update((map) => {
							map.set(user.id, user);
							return map;
						});
					}
					return user;
				})
				.catch((error) => {
					console.error(`Error fetching user ${id}:`, error);
					return undefined;
				});

			// Add to SSR promises to track
			ssrPromises.push(promise);

			// In SSR, we can't return undefined and expect a re-render,
			// so we need to handle this differently in the component
			return undefined;
		} else {
			// Client-side batching logic
			pendingIdsStore.update((set) => {
				set.add(id);
				return set;
			});

			// Schedule a batch fetch if not already scheduled
			if (batchTimer === null) {
				batchTimer = setTimeout(() => {
					fetchBatch();
					batchTimer = null;
				}, DEBOUNCE_TIME);
			}

			// Return undefined for now, the component will re-render when the data arrives
			return undefined;
		}
	}

	/**
	 * Get multiple users by ID. Missing users will be fetched in a batch.
	 */
	function getMany(ids: bigint[]): (User | undefined)[] {
		// Filter out IDs that we don't have yet
		const usersMap = getStoreValue(usersStore);
		const missingIds = ids.filter((id) => !usersMap.has(id));

		if (missingIds.length > 0) {
			if (isSSR) {
				// In SSR mode, fetch immediately and synchronously
				const promise = api
					.getUsers(missingIds)
					.then((fetchedUsers) => {
						usersStore.update((map) => {
							fetchedUsers.forEach((user) => {
								map.set(user.id, user);
							});
							return map;
						});
						return fetchedUsers;
					})
					.catch((error) => {
						console.error('Error fetching users batch:', error);
						return [];
					});

				// Add to SSR promises to track
				ssrPromises.push(promise);
			} else {
				// Client-side batching logic
				pendingIdsStore.update((set) => {
					missingIds.forEach((id) => set.add(id));
					return set;
				});

				// Schedule a batch fetch if not already scheduled
				if (batchTimer === null) {
					batchTimer = setTimeout(() => {
						fetchBatch();
						batchTimer = null;
					}, DEBOUNCE_TIME);
				}
			}
		}

		// Return what we have now
		const currentUsersMap = getStoreValue(usersStore);
		return ids.map((id) => currentUsersMap.get(id));
	}

	/**
	 * Fetch a batch of users from the API (client-side only)
	 */
	async function fetchBatch() {
		const pendingIdsSet = getStoreValue(pendingIdsStore);
		if (pendingIdsSet.size === 0) return;

		// Convert the pending set to an array
		const idsToFetch = Array.from(pendingIdsSet);

		// Clear the pending set
		pendingIdsStore.update((set) => {
			set.clear();
			return set;
		});

		// Split into batches of BATCH_SIZE
		for (let i = 0; i < idsToFetch.length; i += BATCH_SIZE) {
			const batchIds = idsToFetch.slice(i, i + BATCH_SIZE);
			const batchKey = batchIds.join(',');

			// Skip if we already have a pending request for this batch
			const pendingRequestsMap = getStoreValue(pendingRequestsStore);
			if (pendingRequestsMap.has(batchKey)) continue;

			// Create a promise for this batch
			const promise = api
				.getUsers(batchIds)
				.then((fetchedUsers) => {
					// Update the store with the fetched users
					usersStore.update((map) => {
						fetchedUsers.forEach((user) => {
							map.set(user.id, user);
						});
						return map;
					});

					// Remove the pending request
					pendingRequestsStore.update((map) => {
						map.delete(batchKey);
						return map;
					});

					return fetchedUsers;
				})
				.catch((error) => {
					console.error('Error fetching users:', error);
					pendingRequestsStore.update((map) => {
						map.delete(batchKey);
						return map;
					});
					return [];
				});

			// Store the promise
			pendingRequestsStore.update((map) => {
				map.set(batchKey, promise);
				return map;
			});
		}
	}

	/**
	 * Update or add a user to the store
	 */
	function update(user: User) {
		usersStore.update((map) => {
			map.set(user.id, user);
			return map;
		});
	}

	/**
	 * Remove a user from the store
	 */
	function remove(id: bigint) {
		usersStore.update((map) => {
			map.delete(id);
			return map;
		});
	}

	/**
	 * Clear the entire store
	 */
	function clear() {
		usersStore.set(new Map());
		pendingIdsStore.set(new Set());
		pendingRequestsStore.set(new Map());
	}

	/**
	 * Preload the store with users (useful for SSR hydration)
	 */
	function preload(initialUsers: User[]) {
		usersStore.update((map) => {
			initialUsers.forEach((user) => {
				map.set(user.id, user);
			});
			return map;
		});
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
		const usersMap = getStoreValue(usersStore);
		return JSON.stringify(Array.from(usersMap.values()));
	}

	/**
	 * Hydrate the store from serialized data
	 */
	function hydrate(serializedData: string) {
		try {
			const userData = JSON.parse(serializedData) as User[];
			preload(userData);
		} catch (error) {
			console.error('Error hydrating user store:', error);
		}
	}

	return {
		get,
		getMany,
		update,
		remove,
		clear,
		preload,
		awaitSSR,
		serialize,
		hydrate,
		subscribe: usersStore.subscribe,
		// For debugging
		_getStore: () => getStoreValue(usersStore),
		_getPendingIds: () => getStoreValue(pendingIdsStore),
		_getPendingRequests: () => getStoreValue(pendingRequestsStore),
	};
}

// Create a singleton instance
export const userStore = createUserStore();
