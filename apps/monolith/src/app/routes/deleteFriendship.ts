import { monolith } from 'models';
import { bondIds } from 'helpers';
import { useContract } from '../Contract';
export const deleteFriendship = useContract(
	monolith.deleteFriendship,
	async (user, { tables, connection }, { userId }) => {
		const bond = bondIds(userId, user);
		await tables.friendships.get(bond).delete().run(connection);
		return { status: 'none' };
	}
);
