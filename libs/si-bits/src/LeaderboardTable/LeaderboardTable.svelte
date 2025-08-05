<script lang="ts">
	import { score, type Score } from '@lyku/json-models';
	import { api, getSessionId } from 'monolith-ts-api';
	// import { AchievementTile } from '../AchievementTile';
	import styles from './LeaderboardTable.module.sass';
	import classnames from 'classnames';
	import { onMount } from 'svelte';
	import { scoreStore, userStore, leaderboardStore } from '../CacheProvider';
	import { filterByTimeFrame } from './filterByTimeFrame';
	import { highestScoreByPlayer } from './highestScoreByPlayer';

	const { leaderboard: id = undefined, headers } = $props<{
		leaderboard?: number;
		headers?: string[];
	}>();

	let dropped = $state(true);
	let loading = $state(false);
	let selectedTimeFrame = $state<'day' | 'week' | 'month' | 'year' | 'all'>(
		'week',
	);
	let currentTimeFrameScores = $state<Array<any>>([]);

	onMount(() => {
		if (getSessionId()) {
			// api
			// 	.listenForAchievementGrants({ leaderboard })
			// 	.listen((e) => e.forEach((g) => achievementGrantStore.set(g.id, g)));
		}
	});

	// Replace Await component with async load
	async function loadHighScores() {
		// loading = true;
		try {
			const params: any = { leaderboard: id };

			// Add time frame parameters if not 'all'
			if (selectedTimeFrame !== 'all') {
				params.frameSize = selectedTimeFrame;
				// framePoint defaults to current time on the server
			}

			const result = await api.listHighScores(params);
			result.scores.forEach((score) => scoreStore.set(score.id, score));

			// Add to stores for caching
			result.scores.forEach((a) => scoreStore.set(a.id, a));
			result.users.forEach((a) => userStore.set(a.id, a));
			result.leaderboards.forEach((a) => leaderboardStore.set(a.id, a));
			console.log('aaaah', result.leaderboards, result.scores, result.users);
		} finally {
			loading = false;
		}
	}

	const scores = $derived(
		highestScoreByPlayer(
			filterByTimeFrame([...scoreStore.values()], selectedTimeFrame),
		).sort((a, b) => b.columns[0] - a.columns[0]),
	);

	onMount(() => {
		// loadHighScores();
	});

	// Reload scores when time frame changes
	$effect(() => {
		selectedTimeFrame; // Track dependency
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

	<div class={styles.timeFrameSelector}>
		<label>Time frame:</label>
		<select bind:value={selectedTimeFrame} class={styles.timeFrameSelect}>
			<option value="day">Today</option>
			<option value="week">This Week</option>
			<option value="month">This Month</option>
			<option value="year">This Year</option>
			<option value="all">All Time</option>
		</select>
	</div>

	{#if loading}
		Fetching scores...
	{:else if scores.length}
		<table>
			<thead
				><tr
					><th>Rank</th><th>Name</th
					>{#each leaderboardStore.get(id)?.columnNames ?? headers ?? [] as column}
						<th>{column}</th>
					{/each}</tr
				></thead
			>
			<tbody>
				{#each scores as score, rank}
					<tr
						><td>#{rank + 1}</td><td
							>{userStore.get(score.user)?.username ?? 'Unknown'}</td
						>{#each score.columns as column}
							<td>{column}</td>
						{/each}</tr
					>
				{/each}
			</tbody>
		</table>
	{:else}
		<h3>No scores submitted yet -- you're up!</h3>
	{/if}
</div>
