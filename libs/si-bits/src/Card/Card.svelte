<script lang="ts">
  import styles from './Card.module.sass';
  
  const { block = false, children } = $props();
</script>

<div class={`${styles.card} ${block ? styles.block : ''}`}>
  {@render children?.()}
</div> 