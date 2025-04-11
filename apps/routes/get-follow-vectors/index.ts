import { handleGetFollowVectors } from '@lyku/handles';

export default handleGetFollowVectors(async (users, { db, requester }) => {
	const follows = await db
		.selectFrom('userFollows')
		.select('followee')
		.where('followee', 'in', users)
		.where('follower', '=', requester)
		.execute();
	const set = new Set(follows.map((f) => f.followee));
	return users.map((u) => (set.has(u) ? u : -u));
});
