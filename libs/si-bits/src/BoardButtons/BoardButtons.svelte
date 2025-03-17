<script lang="ts">
	import type { TtfMatch } from '@lyku/json-models';

	const { match, onClick } = $props<{
		match: TtfMatch;
		onClick: (i: number) => void;
	}>();
</script>

<div style="position: absolute; width: 100%; height: 100%;">
	{#each [0, 1, 2, 3, 4, 5, 6, 7, 8] as i}
		{@const piece = match?.board[i]}
		{@const placed = piece !== '-'}
		<button
			disabled={placed}
			tabindex={i + 1}
			style="width: 33.33%; height: 33.33%; background: #00000000; cursor: {placed
				? 'cursor'
				: 'pointer'}; 
             display: inline-block; position: relative; vertical-align: middle; border: none;"
			onclick={() => onClick(i)}
			aria-label={`Place ${piece} in position ${i}`}
		></button>
	{/each}
</div>
