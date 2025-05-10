import { handleGetFollowVectors } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleGetFollowVectors(async (users, { requester }) => {
	const follows = await pg
		.selectFrom('userFollows')
		.select('followee')
		.where('followee', 'in', users)
		.where('follower', '=', requester)
		.execute();
	const set = new Set(follows.map((f) => f.followee));
	return users.map((u) => (set.has(u) ? u : -u));
});
