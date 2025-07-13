<script lang="ts">
	import { achievement, type AchievementGrant } from '@lyku/json-models';
	import { api, getSessionId } from 'monolith-ts-api';
	import { AchievementTile } from '../AchievementTile';
	import styles from './AchievementList.module.sass';
	import classnames from 'classnames';
	import { onMount } from 'svelte';
	import { achievementGrantStore, achievementStore } from '../CacheProvider';

	const { game = undefined } = $props<{
		game?: number;
	}>();

	let dropped = $state(false);
	let loading = $state(true);

	// Replace useEffect with onMount
	$effect(() => {
		if (sessionId) {
			api
				.listenForAchievementGrants({ game })
				.listen((e) => e.forEach((g) => achievementGrantStore.set(g.id, g)));
		}
	});

	// Replace Await component with async load
	async function loadAchievements() {
		loading = true;
		try {
			api
				.listAchievements(game)
				.then((as) => as.forEach((a) => achievementStore.set(a.id, a)));
		} finally {
			loading = false;
		}
	}

	const achievements = $derived(
		[...achievementStore.values()].filter((a) => a.game === game),
	);

	onMount(() => {
		loadAchievements();
	});
	$effect(() => {
		console.log('achievements', achievements);
		console.log('grants', achievementGrantStore);
	});
</script>

<button
	type="button"
	class={classnames(styles.AchievementList, {
		[styles.dropped]: dropped,
	})}
	onclick={() => !dropped && (dropped = true)}
>
	<div
		tabindex="0"
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				dropped = !dropped;
			}
		}}
		role="button"
		aria-label="Toggle achievements"
		class={styles.dropHeader}
		onclick={() => (dropped = !dropped)}
		id="dropper"
	>
		<h2>Achievements</h2>
		<label class={styles.dropper} for="dropper">
			<span>▼</span>
		</label>
	</div>

	{#if loading}
		Fetching achievements...
	{:else if achievements.length}
		{#each achievements.sort((a, b) => a.points - b.points) as ach (ach.id)}
			<AchievementTile
				achievement={ach}
				granted={achievementGrantStore.has(ach.id)}
			/>
		{/each}
	{:else}
		<h3>This game has no achievements yet -- check back soon!</h3>
	{/if}
</button>
