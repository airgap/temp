<script lang="ts">
	import { Image, type ImageProps } from '../Image';
	import styles from './Thumbnail.module.sass';

	export const props = $props<ImageProps>();
</script>

<span class={styles.Thumbnail}>
	<Image {...props} />
</span>
