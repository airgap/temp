<script lang="ts">
	import { DynamicPost, userStore, PostList } from '@lyku/si-bits';
	import type { PageData } from './$types';
	import type { Post, User } from '@lyku/json-models';
	import { onMount } from 'svelte';
	import { PUBLIC_CLOUDFLARE_ACCOUNT_ID } from '$env/static/public';

	const { data } = $props<{
		data: { post: Post; users: User[] } | { error: string };
	}>();
	const { post, error } = data;
	userStore.hydrate(data.users);
</script>

{#if error}
	<p>Error loading post: {error}</p>
{:else if post}
	<PostList posts={[post]} cfAccountId={PUBLIC_CLOUDFLARE_ACCOUNT_ID} />
{:else}
	<p>Loading post...</p>
{/if}
