<script lang="ts">
	import { Image, type ImageShape } from '../Image';
	import styles from '../Image/Image.module.sass';
	import smile from '../smile.png';

	const {
		src = smile,
		alt,
		size,
		shape = 'circle',
	} = $props<{
		src?: string;
		alt?: string;
		size?: number;
		shape?: ImageShape;
	}>();
	console.log('pfp src', src);
</script>

<Image class={styles.ProfilePicture} {shape} src={src ?? smile} {alt} {size} />
