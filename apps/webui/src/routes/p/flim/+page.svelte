<script lang="ts">
	import {
		AchievementList,
		Button,
		Divisio,
		LeaderboardTable,
		userStore,
		scoreStore,
		leaderboardStore,
	} from '@lyku/si-bits';
	import { api, type ThiccSocket } from 'monolith-ts-api';
	import type { Leaderboard, Score, TtfMatch, User } from '@lyku/json-models';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import styles from './page.module.sass';

	const id = 1;

	const { data } = $props<{
		data:
			| {
					users: Promise<User[]>;
					user: User;
					scores: Score[];
					leaderboards: Leaderboard[];
			  }
			| { error: string };
	}>();
	const {
		games,
		users,
		user,
		publishers,
		developers,
		scores,
		leaderboards,
		myRank,
	} = data;
	if (user) userStore.set(-1n, user);
	users?.forEach((user) => userStore.set(user.id, user));
	scores?.forEach((score) => scoreStore.set(score.id, score));
	leaderboards?.forEach((leaderboard) =>
		leaderboardStore.set(leaderboard.id, leaderboard),
	);

	// State management
	// let user = $derived(userStore.get(-1n));
	console.log('flim user', userStore.get(-1n)?.id ?? 'guest');

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
	<div class={styles.gameAndLeaderboard}>
		{#if browser && FlimGamePromise}
			{#await FlimGamePromise}
				<div>Loading game...</div>
			{:then module}
				<svelte:component this={module.default} />
			{:catch error}
				<div>Error loading game: {error.message}</div>
			{/await}
		{/if}
		<LeaderboardTable leaderboard={1n} />
	</div>
	<AchievementList game={id} />
</Divisio>
