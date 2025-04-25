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
		postStore,
	} from '@lyku/si-bits';
	import type { Post, User } from '@lyku/json-models';
	// let postsPromise = api.listHotPosts({});
	import { PUBLIC_CF_HASH } from '$env/static/public';

	const { data } = $props<{
		data:
			| {
					order: Promise<bigint[]>;
					posts: Promise<Post[]>;
					users: Promise<User[]>;
					likes: Promise<BigInt[]>;
					// follows: Promise<Follow[]>;
					continuation?: string;
					user: Promise<User>;
			  }
			| { error: string };
	}>();
	const {
		order,
		posts,
		users,
		error,
		likes,
		continuation,
		user,
		follows,
		friendships,
	} = data;
	console.log(
		'ssssuck',
		// 'users',
		// users,
		// 'likes',
		// likes,
		// 'follows',
		// follows,
		// 'friendships',
		// friendships,
	);
	[
		[users, userStore],
		[likes, myLikeStore],
		[follows, myFollowStore],
		[friendships, myFriendshipStore],
		[posts, postStore],
	].forEach(async ([data, store]) => store.hydrate(await data));
	if (user) {
		currentUserStore.preload(user);
	}
</script>

<FeedPage title="Hot">
	{#if posts}
		<PostList posts={order ?? []} cfHash={PUBLIC_CF_HASH} />
	{:else}
		<h3>{String(error)}</h3>
	{/if}
</FeedPage>
