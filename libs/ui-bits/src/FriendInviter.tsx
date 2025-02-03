import { api } from 'monolith-ts-api';
import { useEffect, useState } from 'react';
import { MatchProposal, User } from '@lyku/json-models';
import { Button } from './Button';
export const FriendInviter = ({
	game,
	user,
	onClose,
}: {
	game: number;
	user: User;
	onClose?: () => void;
}) => {
	// const [streamer, setStreamer] = useState();
	const [friends, setFriends] = useState<User[]>();
	const [invites, setInvites] = useState<MatchProposal[]>();
	const [queried, setQueried] = useState(false);
	const incoming = invites?.filter((i) => i.to === user.id) ?? [];
	const outgoing = invites?.filter((i) => i.from === user.id) ?? [];
	const remaining =
		friends?.filter(
			(f) => !invites?.some((i) => [i.from, i.to].includes(f.id))
		) ?? [];
	const [friendsById, setFriendsById] = useState(new Map<bigint, User>());
	useEffect(() => {
		if (queried) return;
		setQueried(true);
		api.listFriends().then((friends) => {
			setFriends(friends);
			setFriendsById(Object.fromEntries(friends.map((f) => [f.id, f])));
		});
		api
			.listMatchProposals({ game })
			.then(({ proposals }) => setInvites(proposals));
	}, [queried, game]);
	return (
		<>
			<Button onClick={onClose}>&lt; Back</Button>
			{incoming.map((invite) => (
				<>
					Incoming from {friendsById.get(invite.from)?.username}{' '}
					<Button onClick={() => api.acceptMatchProposal(invite.id)}>
						Accept
					</Button>{' '}
					<Button onClick={() => api.declineMatchProposal(invite.id)}>
						Decline
					</Button>
				</>
			))}
			{outgoing.map((invite) => (
				<>
					Sent to {friendsById.get(invite.from)?.username} <Button>Undo</Button>
				</>
			))}
			{remaining.map((friend) => (
				<>
					Invite {friend.username}?{' '}
					<Button onClick={() => api.proposeMatch({ user: friend.id, game })}>
						Invite
					</Button>
				</>
			))}
			{!(invites?.length || friends?.length) && (
				<>Friends you add will show up here!</>
			)}
		</>
	);
};
