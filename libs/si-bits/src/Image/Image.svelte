<script lang="ts">
	import classnames from 'classnames';
	import { formImageUrl } from '../formImageUrl';
	import styles from './Image.module.sass';
	import face from '../face.png';
	import { type ImageShape } from './ImageShape';

	interface Props
		extends Omit<svelte.JSX.ImgHTMLAttributes<HTMLImageElement>, 'id' | 'src'> {
		size?: 'l' | 'm' | 's' | 'full-post';
		bot?: boolean;
		shape?: ImageShape;
	}

	const { size, bot, shape, className, src, onclick } = $props<Props>();
</script>

<img
	class={[
		styles.Image,
		className,
		size && styles[size],
		bot && styles.bot,
		shape === 'squircle' && styles.squircle,
		shape === 'circle' && styles.circle,
		shape === 'rounded' && styles.rounded,
	]}
	{src}
	{onclick}
	alt="Profile"
	role="button"
	style="cursor:pointer"
/>
