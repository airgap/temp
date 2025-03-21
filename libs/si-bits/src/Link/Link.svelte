<script lang="ts">
	import classnames from 'classnames';
	import styles from './Link.module.sass';
	import type { ClassValue } from 'svelte/elements';
	const {
		disabled = false,
		class: className = '',
		href,
		target,
		children,
		...rest
	} = $props<{
		disabled?: boolean;
		class?: ClassValue;
		href?: string;
		target?: string;
		children: [];
		[key: string]: any;
	}>();

	const classes = $derived(classnames(styles.Link, className));

	// Add security check for external links
	const rel = $derived(target === '_blank' ? 'noopener noreferrer' : undefined);
</script>

{#if href}
	<a {href} {target} {rel} class={classes} aria-disabled={disabled} {...rest}>
		{@render children?.()}
	</a>
{:else}
	<button type="button" class={classes} {disabled} {...rest}>
		{@render children?.()}
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
