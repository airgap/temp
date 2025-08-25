<script lang="ts">
	import { api, getSessionId } from '@lyku/monolith-ts-api';
	import type { Group, GroupFilter, GroupMembership } from '@lyku/json-models';
	import { Button } from '../Button';
	import {
		currentUserStore as currentUser,
		groupMembershipStore,
		groupStore,
	} from '../CacheProvider';
	import Image from '../Image/Image.svelte';

	const { group } = $props();
</script>

{#if currentUser}
	{#if groupMembershipStore.get((m) => m.group === g.id) && g.owner !== currentUser.id}
		<Button onClick={() => alert('Coming soon!')}>Leave</Button>
	{:else}
		<Button onClick={() => alert('Coming soon!')}>Join</Button>
	{/if}
{/if}
