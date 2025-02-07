<script lang="ts">
  import styles from './Card.module.sass';
  
  export let block = false;
</script>

<div class={`${styles.card} ${block ? styles.block : ''}`}>
  <slot />
</div> 