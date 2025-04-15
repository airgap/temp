<script lang="ts">
	import styles from './Button.module.sass';
	import {ComingSoon} from '../ComingSoon';

	let {
		disabled = false,
		destructive = false,
		class: className = '',
		type = 'button' as 'button' | 'submit' | 'reset',
		style = {} as Record<string, string>,
		children,
		onClick,
		comingSoon
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
	{#if comingSoon}
		<ComingSoon variant={typeof comingSoon === 'boolean' ?  "full" : comingSoon}/>
	{/if}
</button>
