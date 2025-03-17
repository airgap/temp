<script>
	import styles from './Aerial.module.sass';
	let { loading = false } = $props();
</script>

<div class={styles.aerialContainer}>
	<div class={`${styles.Aerial} ${loading ? styles.loading : ''}`}></div>
</div>
