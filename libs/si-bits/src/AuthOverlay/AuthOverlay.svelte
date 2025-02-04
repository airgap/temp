<script lang="ts">
  import { onMount } from 'svelte';
  import classnames from 'classnames';
  import LoadingOverlay from '../LoadingOverlay/LoadingOverlay.svelte';
  import { listen } from '../Sonic';
  import type { ComponentType } from 'svelte';
  import hidden from '../hidden.module.sass';
  import styles from './AuthOverlay.module.sass';

  const $state = {
    form: null as ComponentType | null,
    loading: false
  };

  onMount(() => {
    listen('showAuth', (newForm) => $state.form = newForm);
    listen('submitClicked', () => $state.loading = true);
    listen('formReplied', () => $state.loading = false);
  });
</script>

<div 
  class={classnames(styles.AuthOverlay, {
    [hidden.hidden]: !$state.form
  })}
>
  <div class={styles.AuthForm}>
    <div 
      class={classnames(styles.interactives, {
        [hidden.hidden]: $state.loading
      })}
    >
      <button 
        class={styles.Close}
        on:click={() => $state.form = null}
      />
      {#if $state.form}
        <svelte:component this={$state.form} />
      {/if}
    </div>
    <LoadingOverlay shown={$state.loading} />
  </div>
</div> 