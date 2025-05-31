<script lang="ts">
	import {
		myReactionStore,
		userStore,
		PostList,
		postStore,
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
	user.then((u) => users.set(-1n, u));
	posts.forEach((p) => postStore.set(p.id, p));
	reactions.forEach((r) => myReactionStore.set(r.id, r.type));
	// userStore.hydrate(users);
	if (user) {
		userStore.set(-1n, user);
	}
</script>

{#if error}
	<p>Error loading post: {error}</p>
{:else if thread}
	<PostList threads={[thread]} cfHash={PUBLIC_CF_HASH} />
{:else}
	<p>Loading post...</p>
{/if}
