<script lang="ts">
	import { Tooltip as TooltipPrimitive } from 'bits-ui';
	import { cn, flyAndScale } from '$lib/utils.js';
	const {
		sideOffset,
		transition = flyAndScale,
		transitionConfig = {
			y: 8,
			duration: 150,
		},
		...rest
	} = $props<{
		sideOffset: number;
		transition: any;
		transitionConfig: any;
		children?: ComponentType;
	}>();
</script>

<TooltipPrimitive.Content
	{transition}
	{transitionConfig}
	{sideOffset}
	class={cn(
		'bg-primary text-primary-foreground z-50 overflow-hidden rounded-md px-3 py-1.5 text-xs',
		className,
	)}
	{...rest}
>
	{@render children?.()}
</TooltipPrimitive.Content>
