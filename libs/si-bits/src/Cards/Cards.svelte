<script lang="ts">
  import { Card } from '../Card/Card.svelte';
  import { Cardless } from '../Cardless';
  import styles from './Cards.module.sass';

  type Props = {
    children?: any[];  // Svelte doesn't use ReactElement, we'll handle components differently
  };

  export let children: Props['children'] = [];
</script>

<div class={styles.Cards}>
  {#each children || [] as child, i (i)}
    {#if child.type === Cardless.name}
      <span>{child}</span>
    {:else}
      <Card>{child}</Card>
    {/if}
  {/each}
</div> 