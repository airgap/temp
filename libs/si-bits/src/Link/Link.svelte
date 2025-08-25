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
		onClick,
		...rest
	} = $props<{
		disabled?: boolean;
		class?: ClassValue;
		href?: string;
		target?: string;
		children: [];
		[key: string]: any;
		onClick?: () => void;
	}>();

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
		onclick={onClick}
		aria-disabled={disabled}
		{...rest}
	>
		{@render children?.()}
	</a>
{:else}
	<button type="button" class={classes} {disabled} onclick={onClick} {...rest}>
		{@render children?.()}
	</button>
{/if}
