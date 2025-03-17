<script lang="ts">
	import styles from './PopupOverlay.module.sass';
	import PopupBox from './PopupBox.svelte';
	import { bind, unbind } from '../bind';
	import { onMount, onDestroy } from 'svelte';

	let shown = $state(false);
	const overlay = String(Math.random()).substring(2);

	const { children } = $props<{ children?: ComponentType }>();

	const showHandler = () => (shown = true);
	const hideHandler = () => (shown = false);

	onMount(() => {
		bind(window, `show${overlay}`, showHandler);
		bind(window, `hide${overlay}`, hideHandler);
	});

	onDestroy(() => {
		unbind(window, `show${overlay}`, showHandler);
		unbind(window, `hide${overlay}`, hideHandler);
	});
</script>

<div class={`${styles.WinOverlay} ${shown ? 'shown' : ''}`}>
	<PopupBox {overlay}>
		{@render children?.()}
	</PopupBox>
</div>
