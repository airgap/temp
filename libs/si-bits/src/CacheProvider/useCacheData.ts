import { derived, type Readable } from 'svelte/store';
import { userStore } from './UserStore';
import { myFollowStore } from './MyFollowStore';
import { myFriendshipStore } from './MyFriendshipStore';
import { postStore } from './PostStore';
import type { FriendshipStatus, Post, User } from '@lyku/json-models';

const isSSR = typeof window === 'undefined';

export function usePost(id: bigint): Readable<Post | undefined> {
	return derived(postStore, (map) => map.get(id));
}

export function usePosts(ids: bigint[]): (Post | undefined)[] {
	return postStore.getMany(ids);
}

/**
 * Reactive hook for Svelte components to use the user store
 *
 * @param id A single user ID
 * @returns A reactive store containing the user object or undefined if not loaded yet
 */
export function useUser(id: bigint): Readable<User | undefined> {
	return derived(userStore, ($usersMap) => $usersMap.get(id));
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

export function useFollow(id: bigint): Readable<boolean | undefined> {
	return derived(myFollowStore, ($myFollowMap) => $myFollowMap.get(id));
}

export function useFollows(ids: bigint[]): (bigint | undefined)[] {
	return myFollowStore.getMany(ids);
}

export function useFriendship(
	id: bigint,
): Readable<FriendshipStatus | undefined> {
	return derived(myFriendshipStore, ($myFriendshipMap) =>
		$myFriendshipMap.get(id),
	);
}

export function useFriendships(
	ids: bigint[],
): (FriendshipStatus | undefined)[] {
	return myFriendshipStore.getMany(ids);
}

/**
 * Hook for Svelte components to use any cache store
 * This is a more generic version that works with the existing cacheStore pattern
 *
 * @param type The type of data to fetch ('users', 'images', etc.)
 * @param ids The IDs to fetch
 * @returns A tuple with the fetched data and loading state
 */
// export function useCacheData<T extends 'users'>(
// 	type: T,
// 	ids: bigint[]
// ): [(User | undefined)[], boolean] {
// 	if (type === 'users') {
// 		const users = useUsers(ids);
// 		const pendingIds = userStore._getPendingIds();
// 		const isLoading =
// 			!isSSR &&
// 			ids.some((id) => {
// 				const store = userStore._getStore();
// 				return !store.has(id) && pendingIds.has(id);
// 			});
// 		return [users as any, isLoading];
// 	}

// 	throw new Error(`useCacheData for type ${type} not implemented`);
// }

/**
 * Wait for all pending SSR requests to complete
 * This should be called before rendering the page in SSR
 */
export async function awaitSSRData(): Promise<void> {
	return userStore.awaitSSR();
}
