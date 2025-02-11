<script lang="ts">
    import { AchievementList } from '@lyku/si-bits';
    import { TtfBoard } from '@lyku/si-bits';
    import { Button } from '@lyku/si-bits';
    import { Divisio } from '@lyku/si-bits';
    import { MatchInfo } from '@lyku/si-bits';
    import { MatchList } from '@lyku/si-bits';
    import { MatchProposalList } from '@lyku/si-bits';
    import { currentUser } from '@lyku/si-bits';
    import styles from './PlayTtf.module.sass';
    import { api, type ThiccSocket } from 'monolith-ts-api';
    import type { TtfMatch } from '@lyku/json-models';
    import { games } from '@lyku/stock-docs';
    import { FriendInviter } from '@lyku/si-bits';
    import { TtfBotList } from '@lyku/si-bits';
    import { WinPanel } from '@lyku/si-bits';
    import { onMount, onDestroy } from 'svelte';

    const { id } = games.ticTacFlow;
    const getMatchId = () => BigInt(window.location.hash.substring(1));

    let user = $currentUser;
    let matchId = getMatchId();
    let match: TtfMatch | undefined;
    let showInvites = false;
    let showMatches = false;
    let showFriends = false;
    let showBots = false;
    let streamer: ThiccSocket<'listenForTtfPlays'> | undefined;

    $: if (matchId && !streamer) {
        streamer = api.listenForTtfPlays(matchId);
        console.log('settings streamer', streamer);
        streamer.listen((newMatch) => match = newMatch);
    }

    $: if (!matchId && match) {
        match = undefined;
        if (streamer) {
            streamer.close();
            streamer = undefined;
        }
    }

    const hashchange = () => matchId = getMatchId();

    $: overlay = matchId
        ? (match?.winner 
            ? WinPanel 
            : () => ({}))
        : user
            ? showMatches
                ? MatchList
                : showInvites
                    ? MatchProposalList
                    : showFriends
                        ? FriendInviter
                        : showBots
                            ? TtfBotList
                            : () => ({
                                $$render: () => `
                                    <h1>Tic Tac Flow</h1>
                                    <Button on:click={() => showMatches = true}>Continue</Button>
                                    <Button on:click={() => showInvites = true}>Match invites</Button>
                                    <Button on:click={() => showFriends = true}>Challenge friend</Button>
                                    <Button on:click={() => showBots = true}>Challenge bot</Button>
                                `
                            })
            : showBots
                ? TtfBotList
                : () => ({
                    $$render: () => `
                        <h1>Tic Tac Flow</h1>
                        Create an account to play with friends!
                        <Button on:click={() => showBots = true}>Challenge bot</Button>
                    `
                });

    onMount(() => {
        document.body.className = styles.ttf;
        window.addEventListener('hashchange', hashchange);
    });

    onDestroy(() => {
        window.removeEventListener('hashchange', hashchange);
    });
</script>

<Divisio layout="v" size="m">
    <div style="width: min(min(600px, 60vh), 60vw); flex-flow: column; margin-left: auto; margin-right: auto;">
        {#if match}
            <MatchInfo {match} />
        {/if}
        <TtfBoard
            {user}
            {match}
            {overlay}
        />
    </div>
    <AchievementList game={id} />
</Divisio>