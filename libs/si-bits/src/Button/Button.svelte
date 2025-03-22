<script lang="ts">
	import styles from './Button.module.sass';

	let {
		disabled = false,
		class: className = '',
		type = 'button' as 'button' | 'submit' | 'reset',
		style = {} as Record<string, string>,
		children,
		onclick,
	} = $props();
</script>

<button {disabled} class={[styles.Button, className]} {type} {style} {onclick}>
	{@render children?.()}
</button>
