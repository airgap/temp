import { monolith } from 'models';
import { useContract } from '../Contract';
import { getUserId } from '../getUserId';

export const listGroupsIOwn = useContract(
	monolith.listGroupsIOwn,
	async (_, { tables, connection }, { msg }) => {
		const userId = await getUserId(msg, tables, connection);
		const groups = await tables.groups
			.getAll(userId, {
				index: 'ownerId',
			})
			.coerceTo('array')
			.run(connection);
		console.log('groups', groups);
		return { groups };
	}
);
