<script lang="ts">
	import styles from './Feed.module.sass';
	import { Divisio } from '@lyku/si-bits';
	let {
		children,
		title,
		actions,
		scrolled = $bindable(false),
	} = $props<{
		children?: any;
		title?: string;
	}>();
</script>

<div
	class={styles.FeedPage}
	onscroll={(e) => (scrolled = e.target.scrollTop > 0)}
>
	<div class={[styles.Feed]}>
		{#if title}
			<h1 class={styles.title}><span>{title}</span></h1>
		{/if}
		{#if actions}
			<div class={styles.actions}>
				{@render actions?.()}
			</div>
		{/if}
		{@render children?.()}
	</div>
	<div class={[styles.shadow, scrolled && styles.scrolled]}></div>
</div>
