<script lang="ts">
	import styles from './DotDotDot.module.sass';
	import { Button } from '../Button';
	const { onClick, dropped } = $props<{
		onClick: () => void;
		dropped: boolean;
	}>();
</script>

<Button {onClick} class={[styles.DotDotDot, dropped && styles.dropped]}>
	<div>
		<span class={styles.one}></span>
		<span class={styles.two}></span>
		<span class={styles.three}></span>
	</div>
</Button>
