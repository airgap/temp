<script lang="ts">
	import styles from './Spinner.module.sass';
	const sizes = ['s', 'm', 'l'] as const;
	type Size = (typeof sizes)[number];

	const { size = 'm' } = $props<{ size: Size }>();
</script>

<span class={[styles.Spinner, styles[size]]}>
	<div></div>
	<div></div>
</span>
