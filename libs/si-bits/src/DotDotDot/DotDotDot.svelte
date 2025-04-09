<script lang="ts">
	import styles from './DotDotDot.module.sass';
	import { Button } from '../Button';
	const { onClick } = $props<{ onClick: () => void }>();
</script>

<Button {onClick} class={styles.DotDotDot}>
	<div>
		<span class={styles.one}></span>
		<span class={styles.two}></span>
		<span class={styles.three}></span>
	</div>
</Button>
