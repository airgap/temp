<script lang="ts">
	import { Image } from '../Image';
	import styles from '../Image/Image.module.sass';
	import smile from '../smile.png';

	const {
		src = smile,
		alt,
		size,
	} = $props<{ src?: string; alt?: string; size?: number }>();
</script>

<Image
	className={styles.ProfilePicture}
	shape="circle"
	src={src ?? smile}
	{alt}
	{size}
/>
