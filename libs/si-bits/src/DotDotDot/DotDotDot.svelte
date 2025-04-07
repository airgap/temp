<script lang="ts">
	import styles from './DotDotDot.module.sass';
	import { Button } from '../Button';
	const { onClick } = $props<{ onClick: () => void }>();
</script>

<Button {onClick} class={styles.DotDotDot}>
	<div>
		<span></span>
		<span></span>
		<span></span>
	</div>
</Button>
