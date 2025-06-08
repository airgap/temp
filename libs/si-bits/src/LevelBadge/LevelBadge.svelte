<script lang="ts">
	import {
		getLevelFromPoints,
		getProgressToNextLevel,
		makeDonut,
	} from '@lyku/helpers';
	import styles from './LevelBadge.module.sass';
	import { derived } from 'svelte/store';

	// Props
	const {
		points,
		progress = false,
		size = 's',
	} = $props<{ points: bigint; progress?: boolean; size?: 's' | 'm' | 'l' }>();
	// export let progress: boolean = false;
	// export let size: 's' | 'm' | 'l' = 's';

	const sizes = {
		s: 25,
		m: 50,
		l: 100,
	} as const;

	const sizeValue = $derived(sizes[size]);
	const half = $derived(sizeValue / 2);
	const level = $derived(getLevelFromPoints(points));
	const progressValue = $derived(getProgressToNextLevel(points));
	$effect(() => console.log(level, progressValue));

	// Generate unique IDs for SVG elements
	const id = $props.id();
	const fillClipId = $derived(`fill-clip-${id}`);
	const nonFillClipId = $derived(`non-fill-clip-${id}`);

	// Calculate dimensions for the fill
	const fillHeight = $derived((progressValue / 100) * sizeValue);
	const yPos = $derived(sizeValue - fillHeight);

	// Full circle with fill percentage based on progress and XOR text effect
	const fillCircle = $derived(`
		<defs>
			<!-- Clip path for the filled area -->
			<clipPath id="${fillClipId}">
				<rect x="0" y="${yPos}" width="${sizeValue}" height="${fillHeight}" />
			</clipPath>

			<!-- Clip path for the non-filled area -->
			<clipPath id="${nonFillClipId}">
				<rect x="0" y="0" width="${sizeValue}" height="${yPos}" />
			</clipPath>
		</defs>

		<!-- Background circle -->
		<circle cx="${half}" cy="${half}" r="${half - 1}" fill="#ffffff17" />

		<!-- Fill that rises from bottom -->
		<circle cx="${half}" cy="${half}" r="${half - 1}" fill="white" clip-path="url(#${fillClipId})" />

		<!-- Text for filled area - in background color -->
		<text x="${half}" y="${half}" text-anchor="middle" dy=".375em" fill="#652966" font-size="${half}" clip-path="url(#${fillClipId})">${level}</text>

		<!-- Text for non-filled area - in fill color -->
		<text x="${half}" y="${half}" text-anchor="middle" dy=".375em" fill="#ffffff" font-size="${half}" clip-path="url(#${nonFillClipId})">${level}</text>
	`);

	const html = $derived(fillCircle);
</script>

<svg
	class={styles.LevelBadge}
	viewBox="0 0 25 25"
	width={sizeValue}
	height={sizeValue}
>
	{@html html}
</svg>
