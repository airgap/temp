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
	}

	const { size, bot, shape, className, src, onclick } = $props<$$Props>();
</script>

<img
	class={classnames(styles.Image, className, size && styles[size], {
		[styles.bot]: bot,
		[styles.squircle]: shape === 'squircle',
		[styles.circle]: shape === 'circle',
	})}
	{src}
	{onclick}
	alt="Profile"
	role="button"
	style="cursor:pointer"
/>
