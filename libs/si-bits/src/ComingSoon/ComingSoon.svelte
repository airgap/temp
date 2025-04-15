<script lang='ts'>
	import styles from './ComingSoon.module.sass';
	export const {variant = 'full'} = $props<{variant?: 'half' | 'full'}>()
</script>
{#if variant === 'half'}
<span class={[styles.ComingSoon, styles.half]}>Coming<br/>Soon!</span>
{:else if variant === 'full'}
<span class={[styles.ComingSoon, styles.full]}>Coming Soon!</span>
{/if}
