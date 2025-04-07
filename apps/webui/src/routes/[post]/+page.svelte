<script lang="ts">
	import {
		DynamicPost,
		userStore,
		myLikeStore,
		PostList,
		currentUserStore,
	} from '@lyku/si-bits';
	import type { PageData } from './$types';
	import type { Post, User } from '@lyku/json-models';
	import { onMount } from 'svelte';
	import { PUBLIC_CF_HASH } from '$env/static/public';

	const { data } = $props<{
		data:
			| { post: Post; users: User[]; likes: BigInt[]; currentUser: User[] }
			| { error: string };
	}>();
	const { post, error, likes, users, currentUser } = data;
	userStore.hydrate(users);
	console.log('likes', likes);
	myLikeStore.hydrate(likes);
	if (currentUser) {
		currentUserStore.preload(currentUser);
	}
</script>

{#if error}
	<p>Error loading post: {error}</p>
{:else if post}
	<PostList posts={[post]} cfHash={PUBLIC_CF_HASH} />
{:else}
	<p>Loading post...</p>
{/if}
