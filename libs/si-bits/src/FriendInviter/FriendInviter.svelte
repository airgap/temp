<script lang="ts">
	import { api } from 'monolith-ts-api';
	import type { MatchProposal, User } from '@lyku/json-models';
	import { Button } from '../Button';

	const { game, user, onClose } = $props<{
		game: number;
		user: User;
		onClose: (() => void) | undefined;
	}>();

	let friends = $state<User[]>([]);
	let invites = $state<MatchProposal[]>([]);
	let friendsById = $state(new Map<bigint, User>());
	let queried = $state(false);

	const incoming = $derived(invites?.filter((i) => i.to === user.id) ?? []);
	const outgoing = $derived(invites?.filter((i) => i.from === user.id) ?? []);
	const remaining = $derived(
		friends?.filter(
			(f) => !invites?.some((i) => [i.from, i.to].includes(f.id)),
		) ?? [],
	);

	// Fetch data on mount if not already queried
	$effect(() => {
		if (!queried) {
			queried = true;
			api.listFriends().then((friendsList) => {
				friends = friendsList;
				friendsById = new Map(friendsList.map((f) => [f.id, f]));
			});
			api
				.listMatchProposals({ game })
				.then(({ proposals }) => (invites = proposals));
		}
	});
</script>

<div>
	<Button onClick={onClose}>&lt; Back</Button>

	{#each incoming as invite (invite.id)}
		<div>
			Incoming from {friendsById.get(invite.from)?.username}
			<Button onClick={() => api.acceptMatchProposal(invite.id)}>Accept</Button>
			<Button onClick={() => api.declineMatchProposal(invite.id)}>
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
			<Button onClick={() => api.proposeMatch({ user: friend.id, game })}>
				Invite
			</Button>
		</div>
	{/each}

	{#if !(invites?.length || friends?.length)}
		<div>Friends you add will show up here!</div>
	{/if}
</div>
