<script lang="ts">
    import type { Property } from 'csstype';
    import type { CSSProperties } from 'react';
    import { Size, sizes } from '../sizes';

    const layouts = { h: 'row', v: 'column' } as const;
    type Layout = keyof typeof layouts;

    export let size: Size;
    export let layout: Layout;
    export let fill: boolean = false;
    export let hang: any = undefined;
    export let alignItems: Property.AlignItems | undefined = undefined;
    export let style: CSSProperties = {};
</script>

<div
    style="
        position: relative;
        display: flex;
        flex-direction: {layouts[layout]};
        gap: {sizes[size]};
        {fill ? 'width: 100%;' : ''}
        align-items: {alignItems || ''};
        {Object.entries(style).map(([key, value]) => `${key}: ${value};`).join(' ')}
    "
>
    <slot></slot>
    {#if hang}
        <div style="position: absolute; top: 0; right: 0">
            {hang}
        </div>
    {/if}
</div> 