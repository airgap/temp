<script lang="ts">
	import styles from './ShowTos.module.sass';
	const { children, onclick } = $props();
</script>

<button class={styles.ShowTos} {onclick}>
	{@render children?.()}
</button>
