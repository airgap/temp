<script lang="ts">
	import type { Property } from 'csstype';
	import type { ComponentType, CSSProperties } from 'react';
	import { type Size, sizes } from '../sizes';

	const layouts = { h: 'row', v: 'column' } as const;
	type Layout = keyof typeof layouts;

	const {
		size,
		layout,
		fill,
		hang,
		alignItems,
		style = {},
		children,
	} = $props<{
		size: Size;
		layout: Layout;
		fill: boolean;
		hang: any;
		alignItems: Property.AlignItems | undefined;
		style: CSSProperties;
		children?: ComponentType;
	}>();
</script>

<div
	style="
        position: relative;
        display: flex;
        flex-direction: {layouts[layout]};
        gap: {sizes[size]};
        {fill ? 'width: 100%;' : ''}
        align-items: {alignItems || ''};
        {Object.entries(style)
		.map(([key, value]) => `${key}: ${value};`)
		.join(' ')}
    "
>
	{@render children?.()}
	{#if hang}
		<div style="position: absolute; top: 0; right: 0">
			{hang}
		</div>
	{/if}
</div>
