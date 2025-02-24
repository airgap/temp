<script lang="ts">
  import { Card } from '../Card';
  import { Cardless } from '../Cardless';
  import styles from './Cards.module.sass';

  type Props = {
    children?: any[];
  };

  const { children = [] } = $props();
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