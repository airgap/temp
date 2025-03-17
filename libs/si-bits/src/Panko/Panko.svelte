<script lang="ts">
	import type { Crumb } from './Crumb';
	const { crumbs } = $props<{ crumbs: Crumb[] }>();
</script>

<ul>
	{#each crumbs as crumb, i}
		<li>
			<a href={crumb.href}>{crumb.label}</a>
			{#if i < crumbs.length - 1}
				<span>&gt;</span>
			{/if}
		</li>
	{/each}
</ul>
