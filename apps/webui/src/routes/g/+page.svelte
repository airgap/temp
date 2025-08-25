<script lang="ts">
	import {
		Button,
		CreateGroupDialog,
		Dialog,
		Group,
		GroupList,
		GroupMembership,
		FeedPage,
		Texticle,
		groupMembershipStore,
		groupStore,
		Post,
	} from '@lyku/si-bits';
	import type { GroupFilter } from '@lyku/json-models';

	let substring = '';
	let filter: GroupFilter | undefined;

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
	let showCreateGroup = $state(false);
	console.log(
		'groupStore',
		groupStore,
		'groupMembershipStore',
		groupMembershipStore,
	);

	function handleAddClick() {
		showCreateGroup = true;
	}
</script>

<FeedPage title="Groups">
	<div>
		<Button onClick={handleAddClick}>Create +</Button>
	</div>
	<br />
	<!--
	<Texticle
		on:input={e => substring = e.detail}
		value={substring}
		pattern={group.properties.name.pattern}
	/>
	<GroupFilterSelect
		value={options.find(o => o.value === filter)}
		on:change={e => filter = e.detail?.value}
	/>
	-->
	<!-- <GroupList {filter} {substring} /> -->
	<GroupList
		groupIds={[...groupStore.values()]
			.sort((a, b) => (a.members > b.members ? 1 : -1))
			.map((g) => g.id)}
	/>
	<CreateGroupDialog bind:visible={showCreateGroup} />
</FeedPage>
