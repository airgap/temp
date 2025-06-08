<script lang="ts">
	import * as UpChunk from '@mux/upchunk';
	import styles from './Chunks.module.sass';
	const { upload, file } = $props<{ upload?: UpChunk; file?: File }>();
	$effect(() => upload?.on('progress', (e) => console.log('PROGRESS', e)));
	$effect(() =>
		console.log('*Upload', upload && Object.entries(upload), 'file', file),
	);
</script>

<div class={styles.Chunks}></div>
