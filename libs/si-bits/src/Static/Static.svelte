<script lang="ts">
	import classnames from 'classnames';
	import styles from './Static.module.sass';

	const { width, height, hidden } = $props<{
		width?: number;
		height?: number;
		hidden?: boolean;
	}>();
</script>

<div
	style="width: {width}px; height: {height}px"
	class={classnames(styles.Static, {
		[styles.hidden]: hidden,
	})}
></div>
