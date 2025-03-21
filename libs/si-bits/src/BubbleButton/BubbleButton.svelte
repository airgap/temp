<script lang="ts">
	import classNames from 'classnames';
	import styles from './BubbleButton.module.sass';
	import type { ComponentType } from 'svelte';
	import Link from '../Link/Link.svelte';
	import type { ClassValue } from 'svelte/elements';
	export type BBVariant = 'primary' | 'secondary';

	// Export all props that can be passed to the Link component
	const p = $props<{
		class: ClassValue;
		href: string | undefined;
		isActive: boolean;
		children: ComponentType;
		right?: boolean;
		variant?: BBVariant;
	}>();
	const { isActive, children, right, variant = 'secondary', ...rest } = p;
	const classes = $derived(
		[styles.BubbleButton,
			{
				[styles.depressed]: isActive,
				[styles.right]: right,
			},
			styles[variant],p.class]
	);
</script>

<Link {...rest} className={classes}>
	{@render children?.()}
</Link>
