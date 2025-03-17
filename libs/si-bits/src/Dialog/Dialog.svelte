<script lang="ts">
	import { onMount } from 'svelte';
	import classnames from 'classnames';
	import LoadingOverlay from '../LoadingOverlay/LoadingOverlay.svelte';
	import type { ComponentType } from 'svelte';
	import hidden from '../hidden.module.sass';
	import styles from './Dialog.module.sass';

	type Animation = 'scale' | 'slide-top' | 'slide-bottom';
	const loading = $state(false);
	const {
		visible = false,
		children = [],
		ondismiss,
		size = 's',
		animation = 'scale',
	} = $props<{
		visible: boolean;
		children: ComponentType;
		ondismiss: () => void;
		size?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'fs' | 'tfs';
		animation?: Animation;
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
			`transform: scale(${$transformSpring / 100}) rotate(${$transformSpring / 5 - 20}deg)`,
		'slide-top': () => `margin-top: ${25 + $transformSpring / 4}vh`,
		'slide-bottom': () => `margin-top: ${75 - $transformSpring / 4}vh`,
	} satisfies Record<Animation, () => string>;
	const transform = $derived(animations[animation]());
</script>

<div
	class={styles.DialogBackdrop}
	style="opacity: {$fadeSpring}; pointer-events: {visible ? 'auto' : 'none'}"
	onclick={ondismiss}
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			ondismiss();
		}
	}}
	role="dialog"
	tabindex="0"
>
	<div
		class={classnames(styles.Dialog, classes[size])}
		style={`${transform}`}
		onclick={(e) => e.stopPropagation()}
		tabindex="0"
		role="dialog"
		onkeydown={(e) => e.stopPropagation()}
	>
		<div
			class={classnames(styles.interactives, {
				[hidden.hidden]: loading,
			})}
		>
			<button class={styles.Close} onclick={ondismiss} aria-label="Close"
			></button>
			{@render children?.()}
		</div>
		<LoadingOverlay visible={loading} />
	</div>
</div>
