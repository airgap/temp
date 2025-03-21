<script lang="ts">
	import BubbleButton from '../BubbleButton/BubbleButton.svelte';
	import styles from './Search.module.sass';
	import search from '../assets/search.svg?raw';
</script>

<!-- <BubbleButton>{@html search}</BubbleButton> -->
<span class={styles.Search}>
	<input type="text" placeholder="Search..." />
	<span>{@html search}</span>
</span>
