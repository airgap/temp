<script lang="ts">
  import type { TtfMatch, User } from '@lyku/json-models';
  import { Link } from '../Link';

  export let user: User | undefined = undefined;
  export let match: TtfMatch;
</script>

{#if user?.id === match.winner}
  <h1>You won!</h1>
  {#if !user?.id}
    <h3>Make an account to earn points when you win!</h3>
  {/if}
{:else}
  <h1>You lost.</h1>
{/if}

<Link href={'#'}>Play again</Link> 