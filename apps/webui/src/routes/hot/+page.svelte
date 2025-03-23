<script lang="ts">
	import { api } from 'monolith-ts-api';
	import { FeedPage, PostList, userStore, myLikeStore } from '@lyku/si-bits';
	import type { Post, User } from '@lyku/json-models';
	// let postsPromise = api.listHotPosts({});

	const { data } = $props<{
		data: { posts: Post[]; users: User[]; likes: BigInt[] } | { error: string };
	}>();
	const { posts, users, error, likes } = data;
	userStore.hydrate(users);
	console.log('likes', likes);
	myLikeStore.hydrate(likes);
</script>

<FeedPage>
	{#if posts}
		<PostList posts={posts ?? []} />
	{:else}
		<h3>{String(error)}</h3>
	{/if}
</FeedPage>
