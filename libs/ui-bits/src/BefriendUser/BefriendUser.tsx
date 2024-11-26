import { CoolLink } from '../CoolLink';
import { api } from 'monolith-ts-api';
import { useState } from 'react';
import { User, FriendshipStatus } from '@lyku/json-models';
import { phrasebook } from '../phrasebook';

export const BefriendUser = ({ user }: { user: User }) => {
	const [status, setStatus] = useState<FriendshipStatus>();
	const [queried, setQueried] = useState(false);
	useState(() => {
		if (queried || status) return;
		setQueried(true);
		api.getFriendshipStatus(user.id).then(r => {
			setStatus(r);
			setQueried(false);
		});
	});
	switch (status) {
		case 'befriended':
			return (
				<CoolLink
					onClick={() => {
						setStatus(undefined);
						api.deleteFriendship(user.id).then(() =>
							setStatus('none'),
						);
					}}
				>
					{phrasebook.defriend} &ndash;
				</CoolLink>
			);
		case 'none':
			return (
				<CoolLink
					onClick={() => {
						setStatus(undefined);
						api.createFriendRequest(user.id).then(() =>
							setStatus('youOffered'),
						);
					}}
				>
					{phrasebook.befriend} +
				</CoolLink>
			);
		case 'theyOffered':
			return (
				<>
					<CoolLink
						onClick={() => {
							setStatus(undefined);
							api.acceptFriendRequest(user.id).then(() =>
								setStatus('befriended'),
							);
						}}
					>
						{phrasebook.acceptFriendRequest} +
					</CoolLink>
					<CoolLink
						onClick={() => {
							setStatus(undefined);
							api.declineFriendRequest(user.id).then(() =>
								setStatus('none'),
							);
						}}
					>
						{phrasebook.declineFriendRequest} &ndash;
					</CoolLink>
				</>
			);
		case 'youOffered':
			return (
				<CoolLink
					onClick={() => {
						setStatus(undefined);
						api.declineFriendRequest(user.id).then(() =>
							setStatus('none'),
						);
					}}
				>
					Rescind -
				</CoolLink>
			);
	}
};
