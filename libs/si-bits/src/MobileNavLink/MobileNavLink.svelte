<script lang="ts">
	import { Link } from '../Link';
	import styles from './MobileNavLink.module.sass';
	const { href, isActive, children, onClick } = $props<{
		href: string | undefined;
		isActive: boolean;
		children: [];
		onClick?: () => void;
	}>();
</script>

<Link {href} class={isActive ? styles.depressed : ''} {onClick}>
	{@render children?.()}
</Link>
