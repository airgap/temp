<script lang="ts">
  import styles from './Card.module.sass';
  
  const { block = false } = $props();
</script>

<div class={`${styles.card} ${block ? styles.block : ''}`}>
  {@render children?.()}
</div> 