import { writable, derived } from 'svelte/store';
import { api } from 'monolith-ts-api';
import type { Post } from '@lyku/json-models';
import { serialize as gSerialize, deserialize as gDeserialize } from '../utils';

// Detect if we're running in SSR mode
const isSSR = typeof window === 'undefined';

/**
 * Creates a Svelte store for posts that automatically fetches missing posts
 * non-redundantly and in batches. Supports both client-side and SSR.
 */
export function createPostStore() {
	// Store all posts in a Map
	const postStore = writable<Map<bigint, Post>>(new Map());

	// Track pending requests to avoid duplicate fetches
	const pendingRequestsStore = writable<Map<string, Promise<Post[]>>>(
		new Map(),
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
	 * Get a post by ID. If the post is not in the cache, it will be fetched.
	 * - In client-side: Multiple calls during the same render cycle will be batched.
	 * - In SSR: Data will be fetched immediately and synchronously for the current request.
	 */
	function get(id: bigint): Post | undefined {
		// If we already have the post, return it immediately
		const postMap = getStoreValue(postStore);
		if (postMap.has(id)) {
			return postMap.get(id);
		}

		if (isSSR) {
			// In SSR mode, fetch immediately and synchronously
			const promise = api
				.getPosts([id])
				.then(([post]) => {
					if (post) {
						postStore.update((map) => {
							const newMap = new Map(map); // Create a new map to ensure reactivity
							newMap.set(post.id, post);
							return newMap;
						});
					}
					return post;
				})
				.catch((error) => {
					console.error(`Error fetching post ${id}:`, error);
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
	 * Get multiple posts by ID. Missing posts will be fetched in a batch.
	 */
	function getMany(ids: bigint[]): (Post | undefined)[] {
		// Filter out IDs that we don't have yet
		const postMap = getStoreValue(postStore);
		const missingIds = ids.filter((id) => !postMap.has(id));

		if (missingIds.length > 0) {
			if (isSSR) {
				// In SSR mode, fetch immediately and synchronously
				const promise = api
					.getPosts(missingIds)
					.then((fetchedPosts) => {
						postStore.update((map) => {
							fetchedPosts.forEach((post) => {
								map.set(post.id, post);
							});
							return map;
						});
						return fetchedPosts;
					})
					.catch((error) => {
						console.error('Error fetching posts batch:', error);
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

		const currentMap = getStoreValue(postStore);
		return ids.map((id) => currentMap.get(id));
	}

	/**
	 * Fetch a batch of posts from the API (client-side only)
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
				.getPosts(batchIds)
				.then((fetched) => {
					// Update the store with the fetched posts
					postStore.update((map) => {
						const newMap = new Map(map); // Create a new map to ensure reactivity
						fetched.forEach((record) => {
							newMap.set(record.id, record);
						});
						return newMap;
					});

					// Remove the pending request
					pendingRequestsStore.update((map) => {
						map.delete(batchKey);
						return map;
					});

					return fetched;
				})
				.catch((error) => {
					console.error('Error fetching posts:', error);
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
	 * Update or add a post to the store
	 */
	function update(post: Post) {
		postStore.update((map) => {
			const newMap = new Map(map); // Create a new map to ensure reactivity
			newMap.set(post.id, post);
			return newMap;
		});
	}

	/**
	 * Remove a post from the store
	 */
	function remove(id: bigint) {
		postStore.update((map) => {
			map.delete(id);
			return map;
		});
	}

	/**
	 * Clear the entire store
	 */
	function clear() {
		postStore.set(new Map());
		pendingIdsStore.set(new Set());
		pendingRequestsStore.set(new Map());
	}

	/**
	 * Preload the store with posts (useful for SSR hydration)
	 */
	function preload(initialRecords: Post[]) {
		postStore.update((map) => {
			const newMap = new Map(map); // Create a new map to ensure reactivity
			initialRecords.forEach((record) => {
				newMap.set(record.id, record);
			});
			return newMap;
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
		const map = getStoreValue(postStore);
		const list = Array.from(map.values());

		return gSerialize(list);
	}

	/**
	 * Hydrate the store from serialized data
	 */
	function hydrate(records: Post[]) {
		try {
			preload(records);
		} catch (error) {
			console.error('Error hydrating post store:', error);
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
		subscribe: postStore.subscribe,
		// For debugging
		_getStore: () => getStoreValue(postStore),
		_getPendingIds: () => getStoreValue(pendingIdsStore),
		_getPendingRequests: () => getStoreValue(pendingRequestsStore),
	};
}

// Create a singleton instance
export const postStore = createPostStore();
