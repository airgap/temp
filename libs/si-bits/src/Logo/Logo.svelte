<script lang="ts">
	import { formImageUrl } from '../formImageUrl';
	import { phrasebook } from '../phrasebook';
	import styles from './Logo.module.sass';

	let { x, y, id, logoElement, flashElement, children } = $props<{
		x?: number;
		y?: number;
		id?: string;
		logoElement: HTMLImageElement;
		flashElement: HTMLDivElement;
		children?: ComponentType;
	}>();
</script>

<div class={styles.Logo} style="left: {x}px; top: {y}px">
	{#if id}
		<img
			src={formImageUrl(id)}
			alt={phrasebook.bounceLogoAlt}
			bind:this={logoElement}
		/>
	{:else}
		{@render children?.()}
	{/if}
	<div class={styles.flash} bind:this={flashElement}></div>
</div>
