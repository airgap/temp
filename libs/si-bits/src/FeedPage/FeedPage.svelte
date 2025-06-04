<script lang="ts">
	import styles from './Feed.module.sass';
	import { Divisio } from '@lyku/si-bits';
	const { children, title, actions } = $props<{
		children?: any;
		title?: string;
	}>();
</script>

<div class={styles.FeedPage}>
	{#if title}
		<h1 class={styles.title}><span>{title}</span></h1>
	{/if}
	{#if actions}
		<div class={styles.actions}>
			{@render actions?.()}
		</div>
	{/if}
	<div class={styles.Feed}>
		{@render children?.()}
	</div>
</div>
