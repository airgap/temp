<script lang="ts">
	import { Button } from '../Button';
	import { Crosshatch } from '../Crosshatch';
	import styles from './Close.module.sass';

	const { disabled = false, className = '' } = $props();
</script>

<Button {disabled} class={`${styles.Close} ${className}`} onclick>
	<Crosshatch width="20px" bright={true} />
</Button>
