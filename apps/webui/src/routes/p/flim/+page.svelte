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

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
	href="https://fonts.googleapis.com/css2?family=Geo:ital@0;1&family=Silkscreen:wght@400;700&display=swap"
	rel="stylesheet"
/>

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
