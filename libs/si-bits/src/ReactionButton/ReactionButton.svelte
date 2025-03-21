<script lang="ts">
	import classnames from 'classnames';
	import { Link } from '../Link';
	import styles from './ReactionButton.module.sass';
	import type { ClassValue } from 'svelte/elements';

	export const reactionTypes = ['like', 'reply', 'echo', 'share'] as const;
	export type ReactionType = (typeof reactionTypes)[number];
	export type Orientation = 'Horizontal' | 'Vertical';
	export type PostReactionHandler = () => void;

	const {
		disabled,
		onClick,
		orientation,
		glyph,
		value,
		class: className,
	} = $props<{
		disabled?: boolean;
		onClick?: PostReactionHandler;
		orientation?: Orientation;
		glyph: string;
		value?: number;
		class?: ClassValue;
	}>();
</script>

<span
	class={[
		styles.Reaction,
		{
			[styles.disabled]: disabled,
			[styles.vertical]: orientation === 'Vertical',
		},
		className,
	]}
>
	<Link {disabled} {onClick}>
		{@html glyph}
	</Link>
	{#if typeof value === 'number'}
		<span class={styles.Stat}>{value}</span>
	{/if}
</span>
