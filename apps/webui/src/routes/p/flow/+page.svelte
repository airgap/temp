<script lang="ts">
	import {
		AchievementList,
		Button,
		currentUserStore as currentUser,
		Divisio,
		FriendInviter,
		MatchInfo,
		MatchList,
		MatchProposalList,
		TtfBoard,
		TtfBotList,
		WinPanel,
	} from '@lyku/si-bits';
	import styles from './PlayTtf.module.sass';
	import { api, type ThiccSocket } from 'monolith-ts-api';
	import type { TtfMatch } from '@lyku/json-models';
	import { games } from '@lyku/stock-docs';
	import { onMount, onDestroy } from 'svelte';

	const { id } = games.ticTacFlow;

	// State management
	let user = $state($currentUser);
	let matchId = $state(BigInt(window.location.hash.substring(1) || '0'));
	let match = $state<TtfMatch | undefined>(undefined);
	let showInvites = $state(false);
	let showMatches = $state(false);
	let showFriends = $state(false);
	let showBots = $state(false);
	let streamer = $state<ThiccSocket<'listenForTtfPlays'> | undefined>(
		undefined,
	);

	// Handle streamer setup and cleanup
	$effect(() => {
		if (matchId && !streamer) {
			streamer = api.listenForTtfPlays(matchId);
			streamer.listen((newMatch) => (match = newMatch));
		}
	});

	$effect(() => {
		if (!matchId && match) {
			match = undefined;
			if (streamer) {
				streamer.close();
				streamer = undefined;
			}
		}
	});

	// Hash change handler
	function handleHashChange() {
		const hash = window.location.hash.substring(1);
		matchId = hash ? BigInt(hash) : 0n;
	}

	// Computed overlay component
	const overlay = $derived(() => {
		if (matchId) {
			return match?.winner ? WinPanel : () => ({});
		}

		if (user) {
			if (showMatches) return MatchList;
			if (showInvites) return MatchProposalList;
			if (showFriends) return FriendInviter;
			if (showBots) return TtfBotList;

			return () => ({
				$$render: () => `
                    <h1>Tic Tac Flow</h1>
                    <Button onClick={() => showMatches = true}>Continue</Button>
                    <Button onClick={() => showInvites = true}>Match invites</Button>
                    <Button onClick={() => showFriends = true}>Challenge friend</Button>
                    <Button onClick={() => showBots = true}>Challenge bot</Button>
                `,
			});
		}

		return showBots
			? TtfBotList
			: () => ({
					$$render: () => `
                <h1>Tic Tac Flow</h1>
                Create an account to play with friends!
                <Button onClick={() => showBots = true}>Challenge bot</Button>
            `,
				});
	});

	// Lifecycle
	onMount(() => {
		document.body.className = styles.ttf;
		window.addEventListener('hashchange', handleHashChange);
	});

	onDestroy(() => {
		if (streamer) {
			streamer.close();
		}
		window.removeEventListener('hashchange', handleHashChange);
	});
</script>

<Divisio layout="v" size="m">
	<div
		style="width: min(min(600px, 60vh), 60vw); flex-flow: column; margin-left: auto; margin-right: auto;"
	>
		{#if match}
			<MatchInfo {match} />
		{/if}
		<TtfBoard {user} {match} {overlay} />
	</div>
	<AchievementList game={id} />
</Divisio>
