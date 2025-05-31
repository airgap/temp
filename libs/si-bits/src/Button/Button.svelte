<script lang="ts">
	import styles from './Button.module.sass';
	import { ComingSoon } from '../ComingSoon';

	let {
		destructive = false,
		class: className = '',
		children,
		onClick,
		comingSoon,
		...rest
	} = $props();
</script>

<button
	class={[styles.Button, destructive && styles.destructive, className]}
	onclick={onClick}
	{...rest}
>
	{@render children?.()}
	{#if comingSoon}
		<ComingSoon
			variant={typeof comingSoon === 'boolean' ? 'full' : comingSoon}
		/>
	{/if}
</button>
