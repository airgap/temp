import { useContract } from '../Contract';
import { monolith } from 'models';
import { bindIds } from 'helpers';

export const leaveGroup = useContract(
	monolith.leaveGroup,
	async (group, { tables, connection }, { userId }) => {
		const doc = tables.groupMemberships.get(bindIds(userId, group));
		const res = await doc
			.and(tables.groups.get(group)('owner').ne(userId))
			.branch(doc.delete(), false)
			.run(connection);
		if (!res) throw new Error('Cannot leave group');
	},
);
