import { monolith } from 'models';
import { useContract } from '../Contract';
import { bondIds } from 'helpers';

export const declineFriendRequest = useContract(
	monolith.declineFriendRequest,
	async (user, { tables, connection }, { userId }) => {
		const bond = bondIds(userId, user);
		await tables.friendRequests.get(bond).delete().run(connection);
	},
);
