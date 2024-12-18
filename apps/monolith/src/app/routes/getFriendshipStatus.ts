import { bondIds } from 'helpers';
import { useContract } from '../Contract';
import { FromSchema } from 'from-schema';
import { friendRequest, monolith } from 'models';
export const getFriendshipStatus = useContract(
	monolith.getFriendshipStatus,
	async (user, { tables, connection }, { userId }) => {
		const bond = bondIds(userId, user);
		const befriended = await tables.friendships
			.get(bond)
			.branch(true, false)
			.run(connection);
		if (befriended) return 'befriended';
		const request: FromSchema<typeof friendRequest> | null =
			await tables.friendRequests.get(bond).default(null).run(connection);
		if (!request) return 'none';
		return request.from === userId ? 'youOffered' : 'theyOffered';
	},
);
