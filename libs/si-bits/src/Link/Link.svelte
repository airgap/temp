<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import classnames from 'classnames';

  export let disabled: boolean = false;
  export let className: string = '';
  export let href: string | undefined = undefined;
  export let target: string | undefined = undefined;

  const dispatch = createEventDispatcher();

  function handleClick(event: MouseEvent) {
    dispatch('click', event);
  }

  $: classes = classnames('link', className);
</script>

{#if href}
  <a
    {href}
    {target}
    class={classes}
    aria-disabled={disabled}
    on:click={handleClick}
    on:mouseover
    on:focus
  >
    <slot />
  </a>
{:else}
  <button
    class={classes}
    {disabled}
    on:click={handleClick}
    on:mouseover
    on:focus
  >
    <slot />
  </button>
{/if}

<style lang="sass">
  .link
    // Add your styles here, migrated from Link.module.sass
    cursor: pointer
    text-decoration: none
    
    &:disabled
      cursor: not-allowed
</style> 