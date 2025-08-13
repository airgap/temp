<script lang="ts">
	import { score, type Score } from '@lyku/json-models';
	import { api, getSessionId } from '@lyku/monolith-ts-api';
	// import { AchievementTile } from '../AchievementTile';
	import styles from './LeaderboardTable.module.sass';
	import classnames from 'classnames';
	import { onMount } from 'svelte';
	import { scoreStore, userStore, leaderboardStore } from '../CacheProvider';
	import { filterByTimeFrame } from './filterByTimeFrame';
	import { highestScoreByPlayer } from './highestScoreByPlayer';
	import { Dropdown } from '../Dropdown';
	import { getTimeRemaining } from './getTimeRemaining';

	const { leaderboard: id = undefined, headers } = $props<{
		leaderboard?: number;
		headers: { title: string; visible?: boolean }[];
	}>();

	let dropped = $state(true);
	let loading = $state(false);
	let selectedTimeFrame = $state<'day' | 'week' | 'month' | 'year' | 'all'>(
		'week',
	);
	let currentTimeFrameScores = $state<Array<any>>([]);
	let countdownInfo = $state(getTimeRemaining(selectedTimeFrame));

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
			result.users.forEach((a) => userStore.set(a.id, a));
			result.leaderboards.forEach((a) => leaderboardStore.set(a.id, a));
			console.log('aaaah', result.leaderboards, result.scores, result.users);
		} finally {
			loading = false;
		}
	}
	const leaderboard = $derived(leaderboardStore.get(id));
	const columnVisibility = $derived(
		leaderboard?.columnNames.reduce(
			(o, c) => ({
				...o,
				[c]: headers?.find((h) => h.key === c && h.visible !== false) ?? false,
			}),
			{} as Record<string, boolean>,
		),
	);

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

	// Update countdown every second
	$effect(() => {
		const interval = setInterval(() => {
			countdownInfo = getTimeRemaining(selectedTimeFrame);
		}, 1000);

		// Update immediately when time frame changes
		countdownInfo = getTimeRemaining(selectedTimeFrame);

		return () => clearInterval(interval);
	});
</script>

<div
	class={classnames(styles.LeaderboardTable, {
		[styles.dropped]: dropped,
	})}
>
	<h2>Leaderboard</h2>

	<Dropdown
		bind:value={selectedTimeFrame}
		options={[
			{ value: 'day', label: 'Daily' },
			{ value: 'week', label: 'Weekly' },
			{ value: 'month', label: 'Monthly' },
			{ value: 'year', label: 'Yearly' },
			{ value: 'all', label: 'All Time' },
		]}
		suffix={countdownInfo.formatted}
		suffixColor={countdownInfo.color}
		class={styles.timeFrameSelect}
	/>

	{#if loading}
		Fetching scores...
	{:else if scores.length}
		<table>
			<thead
				><tr
					><th>Rank</th><th>Name</th
					>{#each headers.filter((h) => h.visible !== false) as header}
						<th>{header.title}</th>
					{/each}</tr
				></thead
			>
			<tbody>
				{#each scores as score, rank}
					<tr
						><td>#{rank + 1}</td><td
							>{userStore.get(score.user)?.username ?? 'Unknown'}</td
						>{#each headers as header, i}
							{#if headers.visible !== false}
								<td>{score.columns[i]}</td>
							{/if}
						{/each}</tr
					>
				{/each}
			</tbody>
		</table>
	{:else}
		<h3>Empty board -- you're up!</h3>
	{/if}
</div>
