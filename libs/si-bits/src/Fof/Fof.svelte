<script lang="ts">
  import styles from './Fof.module.sass';
  const {children} = $props<{children?: ComponentType}>();
</script>

<div class={styles.Fof}>
  <h1>{@render children?.()}</h1>
</div> 