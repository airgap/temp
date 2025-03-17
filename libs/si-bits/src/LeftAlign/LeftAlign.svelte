<script lang="ts">
	import styles from './LeftAlign.module.sass';

	const { children } = $props<{ children?: ComponentType }>();
</script>

<div class={styles.LeftAlign}>
	{@render children?.()}
</div>
