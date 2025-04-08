<script lang="ts">
	import styles from './Feed.module.sass';
	const { children, title } = $props<{ children?: ComponentType; title?: string }>();
</script>

<div class={styles.FeedPage}>
	{#if title}
		<h1 class={styles.title}><span>{title}</span></h1>
	{/if}
	<div class={styles.Feed}>
		{@render children?.()}
	</div>
</div>
