<script lang="ts">
  import { onMount } from 'svelte';
  import classnames from 'classnames';
  import LoadingOverlay from '../LoadingOverlay/LoadingOverlay.svelte';
  import { listen } from '../Sonic';
  import type { ComponentType } from 'svelte';
  import hidden from '../hidden.module.sass';
  import styles from './AuthOverlay.module.sass';

  let { form, loading } = $state({
    form: null as ComponentType | null,
    loading: false
  });

  onMount(() => {
    listen('showAuth', (newForm) => form = newForm);
    listen('submitClicked', () => loading = true);
    listen('formReplied', () => loading = false);
  });
</script>

<div 
  class={classnames(styles.AuthOverlay, {
    [hidden.hidden]: !form
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
        onclick={() => form = null}
        aria-label="Close"
      ></button>
      {#if form}
        {form}
      {/if}
    </div>
    <LoadingOverlay shown={loading} />
  </div>
</div> 