import { useContract } from '../Contract';
import { monolith } from 'models';
import { bindIds } from 'helpers';
import { now } from 'rethinkdb';

export const joinGroup = useContract(
	monolith.joinGroup,
	async (group, { tables, connection }, { userId }) => {
		const res = await tables.groups
			.get(group)('private')
			.eq(false)
			.branch(
				tables.groupMemberships.insert({
					group,
					user: userId,
					id: bindIds(userId, group),
					created: now(),
				}),
				false,
			)
			.run(connection);
		if (!res) throw new Error('Cannot join');
	},
);
