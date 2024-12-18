import { monolith } from 'models';
import { bindIds } from 'helpers';
import { useContract } from '../Contract';
import { now } from 'rethinkdb';
export const followUser = useContract(
	monolith.followUser,
	async (user, { tables, connection }, { userId }) => {
		const id = bindIds(userId, user);
		const them = tables.users.get(user);
		const follow = tables.userFollows.get(id);
		const res = await follow
			.branch(
				false,
				them.branch(
					tables.userFollows.insert({
						id,
						follower: userId,
						followee: user,
						created: now(),
					}),
					false,
				),
			)
			.run(connection);
		if (!res) throw 404;
	},
);
