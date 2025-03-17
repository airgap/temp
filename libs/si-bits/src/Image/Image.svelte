<script lang="ts">
	import classnames from 'classnames';
	import { formImageUrl } from '../formImageUrl';
	import styles from './Image.module.sass';
	import face from '../face.png';

	type Shape = 'circle' | 'square' | 'squircle' | 'rounded';

	interface $$Props
		extends Omit<svelte.JSX.ImgHTMLAttributes<HTMLImageElement>, 'id' | 'src'> {
		size?: 'l' | 'm' | 's' | 'full-post';
		bot?: boolean;
		shape?: Shape;
		src?: string;
	}

	const { size, bot, shape, src, className } = $props<$$Props>();
	console.log('IMAGE', src);
</script>

<span
	class={classnames(styles.Image, className, size && styles[size], {
		[styles.bot]: bot,
		[styles.squircle]: shape === 'squircle',
		[styles.circle]: shape === 'circle',
	})}
>
	<img {src} alt="Profile" />
</span>
