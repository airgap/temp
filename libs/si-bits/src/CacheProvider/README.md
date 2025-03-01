# User Store for Svelte

This module provides a reactive store for efficiently fetching and caching user data in Svelte applications. It supports both client-side rendering and server-side rendering (SSR).

## Features

- Automatically fetches missing users from the API
- Batches multiple requests to minimize API calls
- Deduplicates requests for the same user
- Reactive updates when data is available
- Works with both Svelte 4 and Svelte 5
- Full SSR support with hydration

## Usage

### Basic Usage

```svelte
<script>
  import { useUser, useUsers } from '../CacheProvider';
  
  // Get a single user
  let userId = 123n; // bigint ID
  
  // For Svelte 5 with runes
  const user = $derived(useUser(userId));
  
  // For Svelte 4 or without runes
  let user;
  $: user = useUser(userId);
  
  // Get multiple users
  let userIds = [123n, 456n, 789n];
  
  // For Svelte 5 with runes
  const users = $derived(useUsers(userIds));
  
  // For Svelte 4 or without runes
  let users;
  $: users = useUsers(userIds);
</script>

<div>
  {#if user}
    <p>Username: {user.username}</p>
  {:else}
    <p>Loading...</p>
  {/if}
  
  <ul>
    {#each users as user, i}
      <li>
        {#if user}
          User {i}: {user.username}
        {:else}
          Loading user {i}...
        {/if}
      </li>
    {/each}
  </ul>
</div>
```

### Compatibility with Existing Code

For compatibility with existing code that uses the `useCacheData` function:

```svelte
<script>
  import { useCacheData } from '../CacheProvider';
  
  // Get multiple users with loading state
  let userIds = [123n, 456n, 789n];
  
  // For Svelte 5 with runes
  const [users, isLoading] = $derived(useCacheData('users', userIds));
  
  // For Svelte 4 or without runes
  let users, isLoading;
  $: [users, isLoading] = useCacheData('users', userIds);
</script>

<div>
  {#if isLoading}
    <p>Loading users...</p>
  {:else}
    <ul>
      {#each users as user}
        {#if user}
          <li>{user.username}</li>
        {/if}
      {/each}
    </ul>
  {/if}
</div>
```

### Preloading Data

If you have user data from an initial API response, you can preload it into the store:

```ts
import { preloadUsers } from '../CacheProvider';

// Preload users from an API response
api.getInitialData().then(response => {
  preloadUsers(response.users);
});
```

## Server-Side Rendering (SSR)

The user store fully supports SSR with SvelteKit or other SSR frameworks. Here's how to use it:

### 1. In your server-side load function:

```js
// +page.server.js
import { preloadUsers, awaitSSRData, serializeUserStore } from '../CacheProvider';

export async function load({ params }) {
  // Fetch your data
  const post = await api.getPost(params.id);
  
  // Preload the author into the store
  const author = await api.getUser(post.author);
  preloadUsers([author]);
  
  // Wait for any pending SSR data fetches to complete
  await awaitSSRData();
  
  // Serialize the store for client-side hydration
  const serializedUserStore = serializeUserStore();
  
  return {
    post,
    // Include the serialized store data
    initialStoreData: {
      users: serializedUserStore
    }
  };
}
```

### 2. In your client-side component:

```svelte
<script>
  import { onMount } from 'svelte';
  import { hydrateUserStore } from '../CacheProvider';
  
  // Get the data from the server
  export let data;
  
  onMount(() => {
    // Hydrate the store with the data from the server
    if (data.initialStoreData?.users) {
      hydrateUserStore(data.initialStoreData.users);
    }
  });
</script>

<!-- Your component content -->
```

### 3. Using the store in your components:

Components can use the store the same way in both SSR and client-side contexts. The store automatically detects the environment and behaves appropriately.

## How It Works

1. When you call `useUser(id)` or `useUsers(ids)`, the store first checks if the users are already cached.
2. If a user is not in the cache:
   - In client-side mode: It's added to a pending queue and fetched in a batch after a short debounce period.
   - In SSR mode: It's fetched immediately and synchronously.
3. When the API responds, the store is updated and components re-render automatically.
4. During SSR, the store data is serialized and sent to the client for hydration.
5. On the client, the store is hydrated with the initial data before components mount.

This approach minimizes API calls while ensuring components have the data they need as soon as possible, in both SSR and client-side contexts. 