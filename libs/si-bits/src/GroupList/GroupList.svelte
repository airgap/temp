<script lang="ts">
	import { api, getSessionId } from '@lyku/monolith-ts-api';
	import type { Group, GroupFilter, GroupMembership } from '@lyku/json-models';
	import { Button } from '../Button';
	import { currentUserStore as currentUser } from '../CacheProvider';
	import { GroupIcon } from '../GroupIcon';
	import styles from './GroupList.module.sass';
	import {
		groupMembershipStore,
		groupStore,
		userStore,
	} from '../CacheProvider';
	import { JoinLeaveGroup } from '../JoinLeaveGroup';
	import { Link } from '../Link';

	const { groupIds } = $props();

	const groups = $derived(groupIds.map((id) => groupStore.get(id)));
</script>

{#if groupIds?.length}
	<ul class={styles.GroupList}>
		{#each groups as g (g.id)}
			<li>
				<div class={styles.groupInfo}>
					<GroupIcon group={g.id} />
					<h3><Link href={`/g/${g.slug}`}>{g.name}</Link></h3>
					<span class={styles.memberCount}
						>{g.members.toLocaleString()} member{g.members > 1 ? 's' : ''}</span
					>
				</div>
				<div class={styles.groupActions}>
					<JoinLeaveGroup group={g.id} />
					{#if g.owner === userStore.get(-1n)?.id}
						<Link href={`/g/${g.slug}/edit`}>Manage</Link>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
{:else}
	<p>You're not in any groups!</p>
{/if}
