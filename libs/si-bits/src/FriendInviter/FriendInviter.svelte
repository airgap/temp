<script lang="ts">
    import { api } from 'monolith-ts-api';
    import type { MatchProposal, User } from '@lyku/json-models';
    import { Button } from '../Button';

    export let game: number;
    export let user: User;
    export let onClose: (() => void) | undefined = undefined;

    let friends: User[] = [];
    let invites: MatchProposal[] = [];
    let friendsById = new Map<bigint, User>();
    let queried = false;

    $: incoming = invites?.filter((i) => i.to === user.id) ?? [];
    $: outgoing = invites?.filter((i) => i.from === user.id) ?? [];
    $: remaining = friends?.filter(
        (f) => !invites?.some((i) => [i.from, i.to].includes(f.id))
    ) ?? [];

    // Fetch data on mount if not already queried
    $: if (!queried) {
        queried = true;
        api.listFriends().then((friendsList) => {
            friends = friendsList;
            friendsById = new Map(friendsList.map((f) => [f.id, f]));
        });
        api.listMatchProposals({ game })
            .then(({ proposals }) => invites = proposals);
    }
</script>

<div>
    <Button on:click={onClose}>&lt; Back</Button>
    
    {#each incoming as invite (invite.id)}
        <div>
            Incoming from {friendsById.get(invite.from)?.username}
            <Button on:click={() => api.acceptMatchProposal(invite.id)}>
                Accept
            </Button>
            <Button on:click={() => api.declineMatchProposal(invite.id)}>
                Decline
            </Button>
        </div>
    {/each}

    {#each outgoing as invite (invite.id)}
        <div>
            Sent to {friendsById.get(invite.from)?.username}
            <Button>Undo</Button>
        </div>
    {/each}

    {#each remaining as friend (friend.id)}
        <div>
            Invite {friend.username}?
            <Button on:click={() => api.proposeMatch({ user: friend.id, game })}>
                Invite
            </Button>
        </div>
    {/each}

    {#if !(invites?.length || friends?.length)}
        <div>Friends you add will show up here!</div>
    {/if}
</div> 