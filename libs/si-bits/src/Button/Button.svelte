<script lang="ts">
	import styles from './Button.module.sass';

	let {
		disabled = false,
		destructive = false,
		class: className = '',
		type = 'button' as 'button' | 'submit' | 'reset',
		style = {} as Record<string, string>,
		children,
		onClick,
	} = $props();
</script>

<button
	{disabled}
	class={[styles.Button, destructive && styles.destructive, className]}
	{type}
	{style}
	onclick={onClick}
>
	{@render children?.()}
</button>
