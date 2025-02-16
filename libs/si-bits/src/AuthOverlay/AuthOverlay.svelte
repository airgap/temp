<script lang="ts">
  import { onMount } from 'svelte';
  import classnames from 'classnames';
  import LoadingOverlay from '../LoadingOverlay/LoadingOverlay.svelte';
  import { listen } from '../Sonic';
  import type { ComponentType } from 'svelte';
  import hidden from '../hidden.module.sass';
  import styles from './AuthOverlay.module.sass';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  $: loading = false;
  export let visible = false;
</script>

<div 
  class={classnames(styles.AuthOverlay, {
    [hidden.hidden]: !visible
  })}
>
  <div class={styles.AuthForm}>
    <div 
      class={classnames(styles.interactives, {
        [hidden.hidden]: loading
      })}
    >
      <button 
        class={styles.Close}
        onclick={() => dispatch('dismiss')}
        aria-label="Close"
      ></button>
      <slot />
    </div>
    <LoadingOverlay visible={loading} />
  </div>
</div> 