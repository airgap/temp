<script lang="ts">
	import { Button } from '../Button.svelte';
	import { GroupList } from '../GroupList.svelte';
	import type { GroupFilter } from '@lyku/json-models';

	let substring = '';
	let filter: GroupFilter | undefined;

	function handleAddClick() {
		alert('Coming soon!');
	}
</script>

<div style="margin: auto; width: 800px; max-width: 100%">
	<h2 style="display: flex">
		Groups <Button on:click={handleAddClick}>+</Button>
	</h2>
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
</div> 