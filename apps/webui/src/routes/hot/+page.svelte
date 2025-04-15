<script lang="ts">
	import { api } from 'monolith-ts-api';
	import {
		FeedPage,
		PostList,
		userStore,
		myFollowStore,
		myFriendshipStore,
		myLikeStore,
		currentUserStore,
	} from '@lyku/si-bits';
	import type { Post, User } from '@lyku/json-models';
	// let postsPromise = api.listHotPosts({});
	import { PUBLIC_CF_HASH } from '$env/static/public';

	const { data } = $props<{
		data:
			| {
					posts: Post[];
					users: User[];
					likes: BigInt[];
					continuation?: string;
					user: User;
			  }
			| { error: string };
	}>();
	const { posts, users, error, likes, continuation, user, follows, friendships } = data;
	userStore.hydrate(users);
	myLikeStore.hydrate(likes);
	myFollowStore.hydrate(follows);
	myFriendshipStore.hydrate(friendships);
	if (user) {
		currentUserStore.preload(user);
	}
</script>

<FeedPage title="Hot">
	{#if posts}
		<PostList posts={posts ?? []} cfHash={PUBLIC_CF_HASH} />
	{:else}
		<h3>{String(error)}</h3>
	{/if}
</FeedPage>
