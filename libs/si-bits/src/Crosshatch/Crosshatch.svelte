<script lang="ts">
	import classnames from 'classnames';
	import styles from './Crosshatch.module.sass';

	const {
		width = undefined,
		height = undefined,
		style = {},
		bright = false,
	} = $props<{
		width?: string;
		height?: string;
		style?: Record<string, string>;
		bright?: boolean;
	}>();
</script>

<div
	class={classnames(styles.Crosshatch, { [styles.bright]: bright })}
	style:width
	style:height
	{...style}
></div>
