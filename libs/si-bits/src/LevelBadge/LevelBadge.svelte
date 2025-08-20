<script lang="ts">
	import {
		bigMax,
		bigMin,
		getLevelFromPoints,
		getProgressToNextLevel,
		makeDonut,
	} from '@lyku/helpers';
	import styles from './LevelBadge.module.sass';
	import { userStore } from '../CacheProvider';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	// Props
	const { progress = false, size = 'm' } = $props<{
		progress?: boolean;
		size?: 's' | 'm' | 'l';
	}>();
	const targetPoints = $derived(userStore.get(-1n)?.points ?? 0n);

	// Custom bigint tweening
	let points = $state(0n);
	let animationFrame: number | null = null;
	let startPoints = 0n;
	let startTime = 0;
	let lastPoints = $state(0n);
	const duration = $derived(
		Math.min(
			5000,
			Number(
				(bigMax(targetPoints, lastPoints) + 1n) /
					(bigMin(targetPoints, lastPoints) + 1n),
			) * 1000,
		),
	);
	$effect(() => {
		console.log('Duration', duration);
	});
	let hasInitialized = false;

	onMount(() => {
		window.setPoints = (value: BigInt) => {
			userStore.set(-1n, { ...userStore.get(-1n), points: value });
		};
	});

	$effect(() => {
		// When targetPoints changes, start animation
		if (targetPoints !== points) {
			// Skip animation on first load - jump directly to target
			if (!hasInitialized) {
				points = targetPoints;
				lastPoints = targetPoints;
				hasInitialized = true;
				return;
			}

			startPoints = points;
			startTime = Date.now();

			// Cancel any existing animation
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}

			const animate = () => {
				const elapsed = Date.now() - startTime;
				const progress = Math.min(elapsed / duration, 1);
				const easedProgress = cubicOut(progress);

				// Interpolate between bigints
				const diff = targetPoints - startPoints || 0;
				points = startPoints + BigInt(Math.floor(Number(diff) * easedProgress));

				if (progress < 1) {
					animationFrame = requestAnimationFrame(animate);
				} else {
					points = targetPoints;
					animationFrame = null;
					lastPoints = points;
				}
			};

			animationFrame = requestAnimationFrame(animate);
		}

		return () => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
		};
	});
	// export let progress: boolean = false;
	// export let size: 's' | 'm' | 'l' = 's';

	const sizes = {
		s: 25,
		m: 45,
		l: 100,
	} as const;

	const sizeValue = $derived(sizes[size]);
	const half = $derived(sizeValue / 2);
	const level = $derived(getLevelFromPoints(points));
	const progressValue = $derived(getProgressToNextLevel(points));

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
		<circle cx="${half}" cy="${half}" r="${half}" fill="#ffffff17" />

		<!-- Fill that rises from bottom -->
		<circle cx="${half}" cy="${half}" r="${half}" fill="white" clip-path="url(#${fillClipId})" />

		<!-- Text for filled area - in background color -->
		<text x="${half}" y="${half}" text-anchor="middle" dy=".375em" fill="#652966" font-size="${half}" clip-path="url(#${fillClipId})">${level}</text>

		<!-- Text for non-filled area - in fill color -->
		<text x="${half}" y="${half}" text-anchor="middle" dy=".375em" fill="#ffffff" font-size="${half}" clip-path="url(#${nonFillClipId})">${level}</text>
	`);

	const html = $derived(fillCircle);
</script>

<svg
	class={styles.LevelBadge}
	viewBox="0 0 {sizeValue} {sizeValue}"
	width={sizeValue}
	height={sizeValue}
>
	{@html html}
</svg>
