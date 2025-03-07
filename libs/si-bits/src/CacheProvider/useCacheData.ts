import { userStore } from './UserStore';
import type { User } from '@lyku/json-models';

// Detect if we're running in SSR mode
const isSSR = typeof window === 'undefined';

/**
 * Hook for Svelte components to use the user store
 *
 * @param id A single user ID
 * @returns The user object or undefined if not loaded yet
 */
export function useUser(id: bigint): User | undefined {
	return userStore.get(id);
}

/**
 * Hook for Svelte components to use the user store for multiple users
 *
 * @param ids An array of user IDs
 * @returns An array of user objects (or undefined for users not loaded yet)
 */
export function useUsers(ids: bigint[]): (User | undefined)[] {
	return userStore.getMany(ids);
}

/**
 * Hook for Svelte components to use any cache store
 * This is a more generic version that works with the existing cacheStore pattern
 *
 * @param type The type of data to fetch ('users', 'images', etc.)
 * @param ids The IDs to fetch
 * @returns A tuple with the fetched data and loading state
 */
export function useCacheData<T extends 'users'>(
	type: T,
	ids: bigint[]
): [(User | undefined)[], boolean] {
	if (type === 'users') {
		const users = useUsers(ids);
		const pendingIds = userStore._getPendingIds();
		const isLoading =
			!isSSR &&
			ids.some((id) => {
				const store = userStore._getStore();
				return !store.has(id) && pendingIds.has(id);
			});
		return [users as any, isLoading];
	}

	throw new Error(`useCacheData for type ${type} not implemented`);
}

/**
 * Preload users into the cache
 * Useful for initial data loading or prefetching
 *
 * @param users Array of user objects to add to the cache
 */
export function preloadUsers(users: User[]): void {
	userStore.preload(users);
}

/**
 * Wait for all pending SSR requests to complete
 * This should be called before rendering the page in SSR
 */
export async function awaitSSRData(): Promise<void> {
	return userStore.awaitSSR();
}

/**
 * Serialize the store data for SSR hydration
 */
export function serializeUserStore(): string {
	return userStore.serialize();
}

/**
 * Hydrate the store from serialized data
 */
export function hydrateUserStore(serializedData: string): void {
	userStore.hydrate(serializedData);
}
