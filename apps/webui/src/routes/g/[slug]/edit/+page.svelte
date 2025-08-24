<script lang="ts">
	import { Group, GroupMembership, Post, Thread } from '@lyku/json-models';
	import { api, getSessionId } from '@lyku/monolith-ts-api';
	import {
		Button,
		FeedPage,
		Link,
		PostList,
		groupStore,
		groupMembershipStore,
		postStore,
		userStore,
	} from '@lyku/si-bits';
	import { page } from '$app/stores';

	const groupSlug = $derived($page.params.slug?.toLowerCase());

	const { data } = $props<{
		data:
			| {
					memberships?: Promise<GroupMembership[]>;
					groups: Group[];
					posts: Post[];
			  }
			| { error: string };
	}>();
	data.memberships?.forEach((m) =>
		groupMembershipStore.set(m.user + '~' + m.group, m),
	);
	data.groups?.forEach((g) => groupStore.set(g.id, g));
	data.posts?.forEach((p) => postStore.set(p.id, p));

	// Get cache from context and derive group data
	const group = $derived(
		groupSlug
			? groupStore.values().find((g) => g.lowerSlug === groupSlug)
			: undefined,
	);
	$effect(() =>
		console.log(
			'groupSlug',
			groupSlug,
			'groupStore',
			[...groupStore.values()],
			'group',
			group,
		),
	);
</script>

<FeedPage title={group?.name ?? '404'}>
	{#snippet actions()}
		{#if group?.owner === userStore.get(-1n)?.id}<Link
				href="/g/{group.slug}/edit">Edit</Link
			>
		{/if}{/snippet}

	<PostList threads={data.posts?.map((p) => ({ focus: p.id }))} />
</FeedPage>
