<script lang="ts">
  import classnames from 'classnames';
  import styles from './Link.module.sass';
  const { disabled = false, className = '', href, target } = $props<{ disabled?: boolean; className?: string; href?: string; target?: string }>();

  const classes = $derived(classnames(styles.Link, className));

  // Add security check for external links
  const rel = $derived(target === '_blank' ? 'noopener noreferrer' : undefined);
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
    {children}
  </a>
{:else}
  <button
    type="button"
    class={classes}
    {disabled}
    on:click
    on:mouseover
    on:focus
    on:mouseenter
    on:mouseleave
    on:keydown
  >
    {children}
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