<script lang="ts">
  import { CoolLink } from '../CoolLink';
  import { api } from 'monolith-ts-api';
  import { phrasebook } from '../phrasebook';
  import type { User } from '@lyku/json-models';

  const { user } = $props<{
    user: User;
  }>();

  let following: boolean | undefined;
  let queried = false;

  $effect(() => {
    if (!queried && following === undefined) {
      queried = true;
      api.amIFollowing(user.id).then((r) => {
        following = r;
        queried = false;
      });
    }
  });
</script>

{#if typeof following === 'boolean'}
  {#if following}
    <CoolLink
      on:click={() => {
        following = undefined;
        api.unfollowUser(user.id).then(() => following = false);
      }}
    >
      {phrasebook.unfollow} &ndash;
    </CoolLink>
  {:else}
    <CoolLink
      on:click={() => {
        following = undefined;
        api.followUser(user.id).then(() => following = true);
      }}
    >
      {phrasebook.follow} +
    </CoolLink>
  {/if}
{/if} 