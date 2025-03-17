<script lang="ts">
	import Loading from './Loading.svelte';
	import h from '../hidden.module.sass';
	import styles from './LoadingOverlay.module.sass';
	import classNames from 'classnames';

	const { visible = false } = $props<{ visible?: boolean }>();
</script>

<div
	class={classNames(styles.LoadingOverlay, {
		[h.hidden]: !visible,
	})}
>
	<Loading />
</div>
