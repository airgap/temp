import { monolith } from 'models';
import { bindIds } from 'helpers';
import { useContract } from '../Contract';

export const unfollowUser = useContract(
	monolith.unfollowUser,
	async (user, { tables, connection }, { userId }) => {
		const bond = bindIds(userId, user);
		const res = await tables.userFollows.get(bond).delete().run(connection);
		if (!res) throw 404;
	},
);
