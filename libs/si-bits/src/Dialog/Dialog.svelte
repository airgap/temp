<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingOverlay from '../LoadingOverlay/LoadingOverlay.svelte';
	import type { ComponentType } from 'svelte';
	import hidden from '../hidden.module.sass';
	import styles from './Dialog.module.sass';
	const variants = {
		normal: styles.normal,
		profile: styles.profile,
	};

	type Animation = 'scale' | 'slide-top' | 'slide-bottom' | 'zoom';
	const loading = $state(false);
	let {
		visible = $bindable(false),
		children = [],
		size = 's',
		animation = 'scale',
		pad = 'm',
		style = '',
		transform: xfm = '',
		variant = 'normal',
		title = '',
	} = $props<{
		title?: string;
		visible: boolean;
		children: ComponentType;
		size?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'fs' | 'tfs';
		animation?: Animation;
		pad?: 'z' | 's' | 'm' | 'l';
		style: string;
		transform: string;
		variant: 'normal' | 'profile';
	}>();
	import { spring } from 'svelte/motion';

	const fadeSpring = spring(0, { stiffness: 0.1, damping: 0.5 });
	const transformSpring = spring(0, { stiffness: 0.2, damping: 0.5 });

	$effect(() => {
		fadeSpring.update((val) => (visible ? 1 : 0));
		transformSpring.update((val) => (visible ? 100 : 0));
	});

	const toggleTransform = () =>
		transformSpring.update((val) => (val ? 0 : 100));
	const snapTransform = () =>
		transformSpring.update((val) => val, { hard: true });

	const classes = {
		xs: styles.xs,
		s: styles.s,
		m: styles.m,
		l: styles.l,
		xl: styles.xl,
		xxl: styles.xxl,
		fs: styles.fs,
		tfs: styles.tfs,
	} as const;
	const animations = {
		scale: () =>
			`transform: ${xfm} translateY(-50%) scale(${$transformSpring / 100}) rotate(${$transformSpring / 5 - 20}deg)`,
		zoom: () =>
			`transform: ${xfm} translateY(-50%) scale(${$transformSpring / 200 + 0.5});`,
		'slide-top': () => `margin-top: ${25 + $transformSpring / 4}vh`,
		'slide-bottom': () => `margin-top: ${75 - $transformSpring / 4}vh`,
	} satisfies Record<Animation, () => string>;
	const transform = $derived(animations[animation]());
</script>

{#if visible}
	<div
		class={styles.DialogBackdrop}
		style="opacity: {$fadeSpring * 2 - 1}; pointer-events: {visible
			? 'auto'
			: 'none'};"
		onclick={() => (visible = false)}
		onkeydown={(e) => {
			if (e.key === 'Escape') {
				visible = false;
			}
		}}
		role="dialog"
		tabindex="0"
	>
		<div
			class={[
				styles.Dialog,
				classes[size],
				variants[variant],
				pad && styles['pad-' + pad],
			]}
			style="{transform}; {style}"
			onclick={(e) => e.stopPropagation()}
			tabindex="0"
			role="dialog"
			onkeydown={(e) => e.stopPropagation()}
		>
			{#if title}<h3 class={styles.title}>{title}</h3>{/if}
			<div class={[styles.interactives, loading && hidden.hidden]}>
				<button
					class={styles.Close}
					onclick={() => (visible = false)}
					aria-label="Close"
				></button>
				{@render children?.()}
			</div>
			<LoadingOverlay visible={loading} />
		</div>
	</div>
{/if}
