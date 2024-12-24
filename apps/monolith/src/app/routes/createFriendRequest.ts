import { monolith } from 'models';
import { now } from 'rethinkdb';

import { useContract } from '../Contract';
import { bondIds } from 'helpers';

export const createFriendRequest = useContract(
	monolith.createFriendRequest,
	async (user, { tables, connection }, { userId: myId }) => {
		const them = await tables.users.get(user).run(connection);
		if (!them) throw new Error('Target user does not exist');
		const id = bondIds(myId, user);
		await tables.friendRequests
			.insert({
				id,
				created: now(),
				from: myId,
				to: user,
			})
			.run(connection);
		return { id };
	}
);
