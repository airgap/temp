import { CoolLink } from '../CoolLink';
import { api } from 'monolith-ts-api';
import { useState } from 'react';
import { User } from '@lyku/json-models';
import { phrasebook } from '../phrasebook';

export const FollowUser = ({ user }: { user: User }) => {
	// const [status, setStatus] = useState<FromSchema<typeof friendshipStatus>>();
	const [following, setFollowing] = useState<boolean>();
	const [queried, setQueried] = useState(false);
	useState(() => {
		if (queried || following) return;
		setQueried(true);
		api.amIFollowing(user.id).then((r) => {
			setFollowing(r);
			setQueried(false);
		});
	});
	return (
		typeof following === 'boolean' &&
		(following ? (
			<CoolLink
				onClick={() => {
					setFollowing(undefined);
					api.unfollowUser(user.id).then(() => setFollowing(false));
				}}
			>
				{phrasebook.unfollow} &ndash;
			</CoolLink>
		) : (
			<CoolLink
				onClick={() => {
					setFollowing(undefined);
					api.followUser(user.id).then(() => setFollowing(true));
				}}
			>
				{phrasebook.follow} +
			</CoolLink>
		))
	);
};
