<script lang="ts">
	import Link from '../Link/Link.svelte';
	import classNames from 'classnames';
	import styles from './CoolLink.module.sass';

	// Export all props that can be passed to the Link component
	const p = $props<
		{
			href: string | undefined;
			className: string | undefined;
			style: string | undefined;
			isActive: boolean;
			children: [];
		} & any
	>();
	const { href, className, style, isActive, children, ...rest } = p;
	const classes = $derived(
		classNames(
			styles.CoolLink,
			{
				[styles.depressed]: isActive,
			},
			className,
		),
	);
</script>

<Link {...rest} {href} className={classes} {style}>
	{@render children?.()}
</Link>
