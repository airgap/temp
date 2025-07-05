<script lang="ts">
	import {
		FeedPage,
		PostList,
		userStore,
		fileStore,
		myFolloweeStore,
		myFollowerStore,
		myFriendshipStore,
		myReactionStore,
		postStore,
	} from '@lyku/si-bits';
	import type { FileDoc, Post, User } from '@lyku/json-models';
	// let postsPromise = api.listHotPosts({});
	import { PUBLIC_CF_HASH } from '$env/static/public';

	const { data } = $props<{
		data:
			| {
					// order: Promise<bigint[]>;
					posts: Promise<Post[]>;
					users: Promise<User[]>;
					likes: Promise<BigInt[]>;
					// follows: Promise<Follow[]>;
					continuation?: string;
					user: Promise<User>;
					reactions: string[];
					files: Promise<FileDoc[]>;
			  }
			| { error: string };
	}>();
	const {
		// order,
		files,
		posts,
		users,
		error,
		reactions,
		// continuation,
		user,
		followees,
		followers,
		friendships,
	} = data;
	console.log(
		'User',
		user,
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
		// [user, currentUserStore],
		// [users, userStore],
		// [reactions, myReactionStore],
		// [followees, myFolloweeStore],
		// [followers, myFollowerStore],
		// [friendships, myFriendshipStore],
		[posts, postStore],
	].forEach(async ([data, store]) => {
		const r = await data;
		console.log('hydrating', r.length);
		// store.hydrate(r);
		r.forEach((d) => store.set(d.id, d));
		console.log('hydrated', r.length);
	});
	followees?.forEach((f) => myFolloweeStore.set(f, true));
	followers?.forEach((f) => myFollowerStore.set(f, true));
	files?.forEach((f) => {
		console.log('Filing', f.id);
		fileStore.set(f.id, f);
	});
	console.log('files', files);
	console.log('uuuu', users);
	users.forEach((u) => userStore.set(u.id, u));
	if (user) userStore.set(-1n, user);
	// userStore.set(-1n,await user);
	// currentUserStore.me = user;
	reactions.forEach((r, i) => myReactionStore.set(posts[i].id, r));
	console.log('user', user);
</script>

<FeedPage title="Hot">
	{#if posts}
		<PostList
			threads={posts.map((p) => ({ focus: p.id })) ?? []}
			cfHash={PUBLIC_CF_HASH}
		/>
	{:else}
		<h3>{String(error)}</h3>
	{/if}
</FeedPage>
