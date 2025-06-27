<script lang="ts">
	import { api } from 'monolith-ts-api';
	import {
		BefriendUser,
		Center,
		Divisio,
		FeedPage,
		FollowUser,
		Link,
		myFolloweeStore,
		myFollowerStore,
		phrasebook,
		PostList,
		postStore,
		ProfilePicture,
		userStore,
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
					target?: bigint;
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
	$inspect(data);
	users?.forEach((u) => userStore.set(u.id, u));
	posts?.forEach((p) => postStore.set(p.id, p));
	// console.log('Hydrating users', users?.length, likes?.length);
	// userStore.hydrate(users);
	// myLikeStore.hydrate(likes);
	// myFollowStore.hydrate(follows);
	// console.log('uuuser', user?.id);
	if (user) userStore.set(-1n, user);
	console.log('taaaarger', target);
	console.log('posts', posts);

	// Get identifier from URL path params using SvelteKit's $page store
	const ident = page.params.username?.toLocaleLowerCase();

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
	const u = $derived(userStore.get(target));
	$effect(() => console.log('is me?', u && userStore.get(-1n)?.id === u?.id));
</script>

{#snippet actions()}
	{#if u && userStore.get(-1n)?.id === u?.id}
		<Link href="/u/{userStore.get(-1n).username}/edit"
			><span style="display:inline-block; transform: scaleX(-1.2) scaleY(1.2)"
				>✎</span
			> Edit</Link
		>
	{/if}
{/snippet}

<FeedPage title={u?.username} {actions}>
	{#if ident}
		{#if error}
			<Center>
				<div>Error: {error.message}</div>
			</Center>
		{:else}
			<Divisio size="l" layout="v">
				<Divisio size="l" layout="h">
					<ProfilePicture size="l" src={u?.profilePicture} shape="rounded" />
					<Divisio size="l" layout="v">
						<p>{phrasebook.bioWip}</p>
					</Divisio>
				</Divisio>
				{#if threads?.length}
					<PostList {threads} cfHash={PUBLIC_CF_HASH} />
				{/if}</Divisio
			>
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
