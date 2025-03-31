<script lang="ts">
	import { api } from 'monolith-ts-api';
	import { FeedPage, PostList, userStore, myLikeStore } from '@lyku/si-bits';
	import type { Post, User } from '@lyku/json-models';
	// let postsPromise = api.listHotPosts({});
	import { PUBLIC_CF_HASH } from '$env/static/public';

	const { data } = $props<{
		data:
			| { posts: Post[]; users: User[]; likes: BigInt[]; continuation?: string }
			| { error: string };
	}>();
	const { posts, users, error, likes, continuation } = data;
	userStore.hydrate(users);
	console.log('likes', likes);
	myLikeStore.hydrate(likes);
</script>

<FeedPage>
	{#if posts}
		<PostList posts={posts ?? []} cfHash={PUBLIC_CF_HASH} />
	{:else}
		<h3>{String(error)}</h3>
	{/if}
</FeedPage>
