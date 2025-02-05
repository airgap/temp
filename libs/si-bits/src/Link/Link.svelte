<script lang="ts">
  import classnames from 'classnames';

  export let disabled: boolean = false;
  export let className: string = '';
  export let href: string | undefined = undefined;
  export let target: string | undefined = undefined;

  $: classes = classnames('link', className);

  // Add security check for external links
  $: rel = target === '_blank' ? 'noopener noreferrer' : undefined;
</script>

{#if href}
  <a
    {href}
    {target}
    {rel}
    class={classes}
    aria-disabled={disabled}
    on:click
    on:mouseover
    on:focus
    on:mouseenter
    on:mouseleave
    on:keydown
  >
    <slot />
  </a>
{:else}
  <button
    type="button"
    class={classes}
    {disabled}
    onclick
    on:mouseover
    on:focus
    on:mouseenter
    on:mouseleave
    on:keydown
  >
    <slot />
  </button>
{/if}

<style lang="sass">
  .link
    cursor: pointer
    text-decoration: none
    
    &:disabled
      cursor: not-allowed
    
    &:hover:not(:disabled)
      text-decoration: underline
    
    &:focus
      outline: 2px solid currentColor
      outline-offset: 2px
</style> 