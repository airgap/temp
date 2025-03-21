<script lang="ts">
	import { Link } from '../Link';
	import { getHomepage } from '../getHomepage';
	import styles from './NavLogo.module.sass';
	import logo from './gifmaker_me.gif';
	import { tempId } from '../tempId';
	import type { ClassValue } from 'svelte/elements';

	const { class: className } = $props<{ className: ClassValue }>();

	// Generate unique ID for mask
	const maskId = Math.random();
</script>

<Link href={getHomepage()} class={[className,styles.NavLogo]}>
	<svg width="35px" height="35px">
		<defs>
			<mask
				id={maskId}
				maskUnits="userSpaceOnUse"
				maskContentUnits="userSpaceOnUse"
			>
				<image xlink:href={logo} width="100%" />
			</mask>
		</defs>
		<g mask="url(#{maskId})">
			<rect
				width="100%"
				height="100%"
				x="0"
				y="0"
				fill="white"
				class={styles.rainbow}
			/>
		</g>
	</svg>
</Link>
