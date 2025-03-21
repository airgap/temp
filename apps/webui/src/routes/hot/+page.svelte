<script lang="ts">
	import { api } from 'monolith-ts-api';
	import { FeedPage, PostList, userStore } from '@lyku/si-bits';
	import type { Post, User } from '@lyku/json-models';
	// let postsPromise = api.listHotPosts({});

	const { data } = $props<{
		data: { posts: Post[]; users: User[] } | { error: string };
	}>();
	const { post, error } = data;
	userStore.hydrate(data.users);
</script>

<FeedPage>
	{#if data.posts}
		<PostList posts={data.posts ?? []} />
	{:else}
		<h3>{String(error)}</h3>
	{/if}
</FeedPage>
