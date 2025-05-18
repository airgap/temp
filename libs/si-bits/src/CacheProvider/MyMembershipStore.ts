import { writable, derived } from 'svelte/store';
import { api } from 'monolith-ts-api';
import { serialize as gSerialize, deserialize as gDeserialize } from '../utils';

// Detect if we're running in SSR mode
const isSSR = typeof window === 'undefined';

/**
 * Creates a Svelte store for users that automatically fetches missing users
 * non-redundantly and in batches. Supports both client-side and SSR.
 */
export function createMyMembershipStore() {
	// Store all users in a Map
	const internalStore = writable<Set<bigint>>(new Set());

	// Track pending requests to avoid duplicate fetches
	const pendingRequestStore = writable<Promise<bigint[]> | undefined>();

	// Track IDs that need to be fetched in the next batch
	const stale = writable<boolean>(false);

	// Debounce time in milliseconds (only used in client-side)
	const DEBOUNCE_TIME = 50;

	// Timer for batching requests (only used in client-side)
	let batchTimer: ReturnType<typeof setTimeout> | null = null;

	// For SSR, we need to track all promises to wait for them to resolve
	const ssrPromises: Promise<any>[] = [];

	// Helper function to safely get the current value of a store
	function getStoreValue<T>(store: {
		subscribe: (callback: (value: T) => void) => any;
	}): T | undefined {
		let value: T;
		const unsubscribe = store.subscribe((currentValue) => {
			value = currentValue;
		});
		unsubscribe();
		return value!;
	}

	/**
	 * Get a like by ID. If the user is not in the cache, it will be fetched.
	 * - In client-side: Multiple calls during the same render cycle will be batched.
	 * - In SSR: Data will be fetched immediately and synchronously for the current request.
	 */
	function get(id: bigint): boolean {
		const map = getStoreValue(internalStore);
		return map?.has(id) ?? false;
	}

	/**
	 * Get multiple likes by ID. Missing likes will be fetched in a batch.
	 */
	function getMany(ids: bigint[]): bigint[] {
		// Filter out IDs that we don't have yet
		const set = getStoreValue(internalStore);

		return set ? ids.filter((id) => set.has(id)) : [];
	}

	/**
	 * Fetch a batch of likes from the API (client-side only)
	 */
	async function refresh() {
		const isStale = getStoreValue(stale);
		if (!isStale) return;

		// Clear the pending set
		stale.update((st) => {
			return false;
		});

		// Skip if we already have a pending request for this batch
		const pendingRequest = getStoreValue(pendingRequestStore);
		if (pendingRequest) return;

		// Create a promise for this batch
		const promise = api
			.listGroupMembershipVectors()
			.then((ids) => {
				// Update the store with the fetched users
				internalStore.update((set) => {
					return new Set(ids);
				});

				// Remove the pending request
				pendingRequestStore.update((map) => undefined);

				return ids;
			})
			.catch((error) => {
				console.error('Error fetching likes:', error);
				pendingRequestStore.update((map) => undefined);
				return [];
			});

		// Store the promise
		pendingRequestStore.update((map) => promise);
	}

	/**
	 * Update or add a group to the store
	 */
	function update(group: bigint) {
		internalStore.update((set) => {
			const newSet = new Set(set); // Create a new map to ensure reactivity
			if (group > 0) newSet.add(group);
			else newSet.delete(-group);
			return newSet;
		});
	}

	/**
	 * Remove a like from the store
	 */
	function remove(id: bigint) {
		internalStore.update((set) => {
			set.delete(id);
			return set;
		});
	}

	/**
	 * Clear the entire store
	 */
	function clear() {
		internalStore.set(new Set());
		stale.set(false);
		pendingRequestStore.set(undefined);
	}

	/**
	 * Preload the store with users (useful for SSR hydration)
	 */
	function preload(initials: Set<bigint>) {
		internalStore.update((set) => {
			return initials;
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
		const set = getStoreValue(internalStore);
		const groups = Array.from(set?.values() ?? []);

		return gSerialize(groups);
	}

	/**
	 * Hydrate the store from serialized data
	 */
	function hydrate(initial: Set<bigint>) {
		try {
			// const userData = gDeserialize(serializedData) as User[];
			preload(initial);
			// console.log('HYDRATED', userData);
		} catch (error) {
			console.error('Error hydrating like store:', error);
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
		subscribe: internalStore.subscribe,
		// For debugging
		_getStore: () => getStoreValue(internalStore),
		_getPendingIds: () => getStoreValue(stale),
		_getPendingRequests: () => getStoreValue(pendingRequestStore),
	};
}

// Create a singleton instance
export const myMembershipStore = createMyMembershipStore();
