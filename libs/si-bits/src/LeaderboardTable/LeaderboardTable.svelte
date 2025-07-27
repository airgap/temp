<script lang="ts">
	import { score, type Score } from '@lyku/json-models';
	import { api, getSessionId } from 'monolith-ts-api';
	// import { AchievementTile } from '../AchievementTile';
	import styles from './LeaderboardTable.module.sass';
	import classnames from 'classnames';
	import { onMount } from 'svelte';
	import { scoreStore } from '../CacheProvider';

	const { leaderboard = undefined } = $props<{
		leaderboard?: number;
	}>();

	let dropped = $state(false);
	let loading = $state(true);

	onMount(() => {
		if (getSessionId()) {
			// api
			// 	.listenForAchievementGrants({ leaderboard })
			// 	.listen((e) => e.forEach((g) => achievementGrantStore.set(g.id, g)));
		}
	});

	// Replace Await component with async load
	async function loadHighScores() {
		loading = true;
		try {
			api
				.listHighScores(leaderboard)
				.then((as) => as.forEach((a) => scoreStore.set(a.id, a)));
		} finally {
			loading = false;
		}
	}

	const scores = $derived(
		[...scoreStore.values()].filter((a) => a.leaderboard === leaderboard),
	);

	onMount(() => {
		loadHighScores();
	});
	$effect(() => {
		console.log('scores', scores);
	});
</script>

<div
	class={classnames(styles.LeaderboardTable, {
		[styles.dropped]: dropped,
	})}
>
	<div
		tabindex="0"
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				dropped = !dropped;
			}
		}}
		role="button"
		aria-label="Toggle leaderboard"
		class={styles.dropHeader}
		onclick={() => (dropped = !dropped)}
		id="dropper"
	>
		<h2>Leaderboard</h2>
		<label class={styles.dropper} for="dropper">
			<span>▼</span>
		</label>
	</div>

	{#if loading}
		Fetching scores...
	{:else if scores.length}
		<table>
			<thead><tr><th>Rank</th><th>Name</th><th>Points</th></tr></thead>
			<tbody>
				{#each scores.sort((a, b) => a.points - b.points) as score, rank}
					<tr><td>{rank}</td><td>{score.name}</td><td>{score.points}</td></tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<h3>No scores submitted yet -- you're up!</h3>
	{/if}
</div>
