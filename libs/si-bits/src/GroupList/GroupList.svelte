<script lang="ts">
	import { api, getSessionId } from 'monolith-ts-api';
	import type { Group, GroupFilter, GroupMembership } from '@lyku/json-models';
	import { Button } from '../Button';
	// import { currentUserStore as currentUser } from '../CacheProvider';
	import styles from './GroupList.module.sass';
	import { userStore } from '../CacheProvider';

	const { substring, filter } = $props<{
		substring?: string;
		filter?: GroupFilter;
	}>();

	let groups = $state<Group[]>([]);
	let memberships = $state<GroupMembership[]>([]);
	let queriedGroups = $state(false);

	$effect(() => {
		if (!queriedGroups && getSessionId()) {
			queriedGroups = true;
			api
				.listGroups({ filter, substring })
				.then(({ groups: g, memberships: m }) => {
					groups = g;
					memberships = m;
				});
		} else if (!queriedGroups) {
			queriedGroups = true;
			api.listGroupsUnauthenticated({ substring }).then((g) => {
				groups = g;
			});
		}
	});
</script>

{#if groups.length}
	<ul>
		{#each groups as g (g.id)}
			<li>
				<h3>{g.name}</h3>
				{#if userStore.get(-1n) && memberships.find((m) => m.group === g.id) && g.owner !== userStore.get(-1n)?.id}
					<Button onClick={() => alert('Coming soon!')}>Leave</Button>
				{:else}
					<Button onClick={() => alert('Coming soon!')}>Join</Button>
				{/if}
			</li>
		{/each}
	</ul>
{:else}
	<p>You're not in any groups!</p>
{/if}
