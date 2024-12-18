import { monolith } from 'models';
import { useContract } from '../Contract';

export const listMyBots = useContract(
	monolith.listMyBots,
	(_, { tables, connection }, { userId }) =>
		tables.users
			.getAll(userId, { index: 'ownerId' })
			.coerceTo('array')
			.run(connection),
);
