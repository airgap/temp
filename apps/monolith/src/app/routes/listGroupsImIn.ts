import { useContract } from '../Contract';
import { getUserId } from '../getUserId';
import { FromSchema } from 'from-schema';
import { group, monolith } from 'models';

export const listGroupsImIn = useContract(
	monolith.listGroupsImIn,
	async (_, { tables, connection }, { msg }) => {
		const userId = await getUserId(msg, tables, connection);
		const groups = await tables.groupMemberships
			.getAll(userId, {
				index: 'userId',
			})
			.map<FromSchema<typeof group>>((membership) =>
				tables.groups.get(membership('group')),
			)
			.coerceTo('array')
			.run(connection);
		console.log('groups', groups);
		return { groups };
	},
);
