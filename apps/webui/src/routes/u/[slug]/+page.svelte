<script lang="ts">
	import { api } from 'monolith-ts-api';
	import {
		BefriendUser,
		Center,
		Divisio,
		FeedPage,
		FollowUser,
		PostList,
		ProfilePicture,
		phrasebook,
		myFolloweeStore,
		myFollowerStore,
		userStore,
		postStore,
	} from '@lyku/si-bits';
	import { page } from '$app/state';
	import type { Post, Thread, User } from '@lyku/json-models';
	import { PUBLIC_CF_HASH } from '$env/static/public';
	console.log('fuck');
	const { data } = $props<{
		data:
			| {
					threads: Thread[];
					posts: Post[];
					users: User[];
					likes: BigInt[];
					follows: BigInt[];
					user: User;
					target?: User;
			  }
			| { error: string };
	}>();
	const {
		threads,
		posts,
		users,
		error,
		likes,
		continuation,
		user,
		target,
		follows,
	} = data;
	users.forEach((u) => userStore.set(u.id, u));
	posts.forEach((p) => postStore.set(p.id, p));
	console.log('Hydrating users', users.length, likes.length);
	// userStore.hydrate(users);
	// myLikeStore.hydrate(likes);
	// myFollowStore.hydrate(follows);
	console.log('uuuser', user?.id);
	if (user) {
		userStore.set(-1n, user);
	}
	console.log('taaaarger', target);
	console.log('posts', posts);

	// Get identifier from URL path params using SvelteKit's $page store
	const ident = page.params.slug;

	// Computed hang content for the profile
	// const hangContent = $derived(() =>
	// 	target
	// 		? {
	// 				component: Divisio,
	// 				props: {
	// 					size: 'm',
	// 					layout: 'v',
	// 					class: 'linkBox',
	// 					children: [FollowUser, BefriendUser],
	// 				},
	// 			}
	// 		: null,
	// );

	$inspect(target);
	console.log('error', error);
</script>

<FeedPage title={target?.username}>
	{#if ident}
		{#if error}
			<Center>
				<div>Error: {error.message}</div>
			</Center>
		{:else}
			<Divisio size="m" layout="h">
				<ProfilePicture size="m" src={target?.profilePicture} />
				<Divisio size="m" layout="v">
					<p>{phrasebook.bioWip}</p>
				</Divisio>
			</Divisio>
			{#if posts?.length}
				<PostList {posts} cfHash={PUBLIC_CF_HASH} />
			{/if}
		{/if}
	{:else}
		<h1>404</h1>
	{/if}
</FeedPage>

<style lang="sass">
  :global(.UserPage)
    width: 100%
    max-width: 800px

  :global(.linkBox)
    margin-left: auto
</style>
