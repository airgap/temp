<script lang="ts">
  import { api, sessionId } from 'monolith-ts-api';
  import { Group, GroupFilter, GroupMembership } from '@lyku/json-models';
  import { Button } from '../Button';
  import { currentUser } from '../currentUserStore';
  import styles from './GroupList.module.sass';

  export let substring: string | undefined = undefined;
  export let filter: GroupFilter | undefined = undefined;

  let groups: Group[] = [];
  let memberships: GroupMembership[] = [];
  let queriedGroups = false;

  $: if (!queriedGroups && sessionId) {
    queriedGroups = true;
    api.listGroups({ filter, substring }).then(({ groups: g, memberships: m }) => {
      groups = g;
      memberships = m;
    });
  } else if (!queriedGroups) {
    queriedGroups = true;
    api.listGroupsUnauthenticated({ substring }).then(g => {
      groups = g;
    });
  }
</script>

{#if groups.length}
  <ul>
    {#each groups as g (g.id)}
      <li>
        <h3>{g.name}</h3>
        {#if $currentUser && memberships.find((m) => m.group === g.id) && g.owner !== $currentUser.id}
          <Button on:click={() => alert('Coming soon!')}>Leave</Button>
        {:else}
          <Button on:click={() => alert('Coming soon!')}>Join</Button>
        {/if}
      </li>
    {/each}
  </ul>
{:else}
  <p>You're not in any groups!</p>
{/if} 