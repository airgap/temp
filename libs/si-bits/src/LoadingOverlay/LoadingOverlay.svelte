<script lang="ts">
  import Loading from './Loading.svelte';
  import h from '../hidden.module.sass';
  import styles from './LoadingOverlay.module.sass';
  
  export let shown: boolean = false;
</script>

<div class={styles.LoadingOverlay} class:{h.hidden}={!shown}>
  <Loading />
</div>