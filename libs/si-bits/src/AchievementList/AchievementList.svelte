<script lang="ts">
	import type { AchievementGrant } from '@lyku/json-models';
	import { api, getSessionId } from 'monolith-ts-api';
	import { AchievementTile } from '../AchievementTile';
	import styles from './AchievementList.module.sass';
	import classnames from 'classnames';

	const { game = undefined } = $props<{
		game?: number;
	}>();

	let grants: Map<bigint, AchievementGrant> = $state(new Map());
	let dropped = $state(false);
	let achievements = $state<any[]>([]);
	let loading = $state(true);

	// Replace useEffect with onMount
	$effect(() => {
		if (sessionId) {
			api
				.listenForAchievementGrants({ game })
				.listen((e) => e.forEach((g) => grants.set(g.id, g)));
		}
	});

	// Replace Await component with async load
	async function loadAchievements() {
		loading = true;
		try {
			achievements = await api.listAchievements({ game });
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		loadAchievements();
	});

	console.log('grants', grants);
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
				granted={grants.some((g) => g.id.startsWith(ach.id.toString()))}
			/>
		{/each}
	{:else}
		<h3>This game has no achievements yet -- check back soon!</h3>
	{/if}
</button>
