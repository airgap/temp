<script lang="ts">
	import styles from './ChannelLogo.module.sass';
	import face from './face.png';

	const { url = undefined } = $props();
</script>

<span class={styles.ChannelLogo}>
	<img src={url || face} alt="Channel logo" />
</span>
