<script lang="ts">
	import { onMount } from 'svelte';
	import { hydrateUserStore } from './useCacheData';
	import PostView from './SSRExample.svelte';

	// Get the data from the server using $props in Svelte 5
	const { data } = $props<{ data: any }>();

	onMount(() => {
		// Hydrate the user store with the data from the server
		if (data.initialStoreData?.users) {
			hydrateUserStore(data.initialStoreData.users);
		}
	});
</script>

<PostView post={data.post} posts={data.replies} />

<!-- 
  Alternative approach using Svelte's <svelte:head> for immediate hydration
  before component mounting:

<svelte:head>
  {#if data.initialStoreData?.users}
    <script>
      // This will run as soon as the page loads, before components mount
      window.__INITIAL_USER_STORE__ = JSON.stringify(data.initialStoreData.users);
    </script>
  {/if}
</svelte:head>
-->

<!-- 
  And in a module script:

<script context="module">
  // This runs once when the module is first imported
  if (typeof window !== 'undefined' && window.__INITIAL_USER_STORE__) {
    // Hydrate from the global variable
    hydrateUserStore(window.__INITIAL_USER_STORE__);
    // Clean up
    delete window.__INITIAL_USER_STORE__;
  }
</script>
-->
