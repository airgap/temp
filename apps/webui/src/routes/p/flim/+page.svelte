<script lang="ts">
	import { AchievementList, Button, Divisio, userStore } from '@lyku/si-bits';
	import { api, type ThiccSocket } from 'monolith-ts-api';
	import type { TtfMatch } from '@lyku/json-models';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	const id = 1;

	// State management
	let user = userStore.get(-1n);

	// Lazy load FlimGame component
	let FlimGamePromise: Promise<any> | null = $state(null);

	if (browser) {
		FlimGamePromise = import('./FlimGame.svelte');
	}
</script>

<Divisio layout="v" size="m">
	{#if browser && FlimGamePromise}
		{#await FlimGamePromise}
			<div>Loading game...</div>
		{:then module}
			<svelte:component this={module.default} />
		{:catch error}
			<div>Error loading game: {error.message}</div>
		{/await}
	{/if}
	<AchievementList game={id} />
</Divisio>
