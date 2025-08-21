<script lang="ts">
	import {
		Button,
		CreateGroupDialog,
		Dialog,
		GroupList,
		FeedPage,
		Texticle,
	} from '@lyku/si-bits';
	import type { GroupFilter } from '@lyku/json-models';

	let substring = '';
	let filter: GroupFilter | undefined;

	let showCreateGroup = $state(false);

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
	<GroupList {filter} {substring} />
	<CreateGroupDialog bind:visible={showCreateGroup} />
</FeedPage>
