<script lang="ts">
	import styles from './Template.module.sass';
	const { children } = $props();
</script>

<div class={styles.Template}>
	{@render children?.()}
</div>
