<script lang="ts">
    import { AchievementList } from '../AchievementList';
    import { TtfBoard } from '../TtfBoard';
    import { Button } from '../Button';
    import { Divisio } from '../Divisio';
    import { MatchInfo } from '../MatchInfo';
    import { MatchList } from '../MatchList';
    import { MatchProposalList } from '../MatchProposalList';
    import { currentUser } from '../currentUserStore';
    import styles from './PlayTtf.module.sass';
    import { api, type ThiccSocket } from 'monolith-ts-api';
    import type { TtfMatch } from '@lyku/json-models';
    import { games } from '@lyku/stock-docs';
    import { FriendInviter } from '../FriendInviter';
    import { TtfBotList } from '../TtfBotList';
    import { WinPanel } from '../WinPanel';
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
            overlay={#if matchId}
                {#if match?.winner}
                    <WinPanel {user} {match} />
                {:else}
                    <></>
                {/if}
            {:else if user}
                {#if showMatches}
                    <MatchList {user} onClose={() => showMatches = false} />
                {:else if showInvites}
                    <MatchProposalList
                        onClose={() => showInvites = false}
                        {user}
                    />
                {:else if showFriends}
                    <FriendInviter
                        game={id}
                        {user}
                        onClose={() => showFriends = false}
                    />
                {:else if showBots}
                    <TtfBotList onClose={() => showBots = false} />
                {:else}
                    <h1>Tic Tac Flow</h1>
                    <Button on:click={() => showMatches = true}>Continue</Button>
                    <Button on:click={() => showInvites = true}>Match invites</Button>
                    <Button on:click={() => showFriends = true}>Challenge friend</Button>
                    <Button on:click={() => showBots = true}>Challenge bot</Button>
                {/if}
            {:else}
                <h1>Tic Tac Flow</h1>
                Create an account to play with friends!
                {#if showBots}
                    <TtfBotList onClose={() => showBots = false} />
                {:else}
                    <Button on:click={() => showBots = true}>Challenge bot</Button>
                {/if}
            {/if}
        />
    </div>
    <AchievementList game={id} />
</Divisio>