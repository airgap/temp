<script lang="ts">
	import {
		fileStore,
		myReactionStore,
		userStore,
		PostList,
		postStore,
		FeedPage,
	} from '@lyku/si-bits';
	import type { Post, Thread, User, Reaction } from '@lyku/json-models';
	import { PUBLIC_CF_HASH } from '$env/static/public';

	const { data } = $props<{
		data:
			| {
					thread: Thread;
					posts: Post[];
					users: User[];
					likes: BigInt[];
					currentUser: User[];
					reactions: Reaction[];
			  }
			| { error: string };
	}>();
	const { posts, thread, error, reactions, users, user } = data;
	users.forEach((u) => userStore.set(u.id, u));
	if (user) userStore.set(-1n, user);
	posts.forEach((p) => postStore.set(p.id, p));
	data.files.forEach((f) => fileStore.set(f.id, f));
	reactions.forEach((r) => myReactionStore.set(r.id, r.type));
</script>

<FeedPage title={error ? 'Error' : ''}>
	{#if error}
		<p>Error loading post: {error}</p>
	{:else if thread}
		<PostList threads={[thread]} cfHash={PUBLIC_CF_HASH} />
	{:else}
		<p>Loading post...</p>
	{/if}
</FeedPage>
