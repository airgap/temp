import { monolith } from 'models';
import { useContract } from '../Contract';
import { getUserId } from '../getUserId';

export const listFriends = useContract(
	monolith.listFriends,
	async (_, { tables, connection }, { msg }) => {
		const myId = await getUserId(msg, tables, connection);
		const userIds = await tables.friendships
			.filter((ship) => ship('users').contains(myId))('users')
			.coerceTo('array')
			.run(connection);
		const others = userIds.map(([a, b]) => (a === myId ? b : a));
		console.log('others', others);
		const friends = others.length
			? await tables.users
					.getAll(...others)
					.coerceTo('array')
					.run(connection)
			: [];
		return { friends };
	}
);
