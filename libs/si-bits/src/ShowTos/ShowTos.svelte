<script lang="ts">
  import styles from './ShowTos.module.sass';
  const { children } = $props();
</script>

<button
  class={styles.ShowTos}
  onclick={() => window.dispatchEvent(new CustomEvent('showTos'))}
>
  {@render children?.()}
</button> 