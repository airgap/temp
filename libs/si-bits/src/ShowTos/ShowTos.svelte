<script lang="ts">
  import styles from './ShowTos.module.sass';
</script>

<button
  class={styles.ShowTos}
  on:click={() => window.dispatchEvent(new CustomEvent('showTos'))}
>
  <slot />
</button> 