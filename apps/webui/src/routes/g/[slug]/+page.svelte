<script lang="ts">
	import { api, getSessionId } from '@lyku/monolith-ts-api';
	import { PostList } from '@lyku/si-bits';
	import { page } from '$app/stores';

	// Get groupId from route params instead of window.location
	const groupSlug = $derived($page.params.slug?.toLowerCase());

	// Get cache from context and derive group data
	const group = $derived(
		groupSlug
			? groupStore.values().find((g) => g.lowerSlug === groupSlug)
			: undefined,
	);

	// Create posts promise based on auth state
	const postsPromise = $derived(
		getSessionId()
			? api.listFeedPosts({ groups: [BigInt(groupId)] })
			: api.listFeedPostsUnauthenticated({ groups: [BigInt(groupId)] }),
	);

	let error = $state<Error | null>(null);
	let loading = $state(true);
	let posts = $state<any[]>([]);

	// Effect to handle promise
	$effect(() => {
		loading = true;
		error = null;

		postsPromise
			.then((result) => {
				posts = result;
				loading = false;
			})
			.catch((e) => {
				error = e;
				loading = false;
			});
	});
</script>

{#if group}
	<h2>{group.name}</h2>
{/if}

{#if loading}
	<p>Loading posts...</p>
{:else if error}
	<p>Error loading posts: {error.message}</p>
{:else}
	<PostList {posts} />
{/if}
