import { useContract } from '../Contract';
import { monolith } from 'models';
import { bindIds } from 'helpers';

export const getGroup = useContract(
	monolith.getGroup,
	async (id, { tables, connection }, { userId }) => {
		const group = await tables.groups.get(id).run(connection);
		if (!group) throw 404;
		const membership =
			userId &&
			(await tables.groupMemberships
				.get(bindIds(userId, id))
				.default(false)
				.run(connection));
		return {
			group,
			...(typeof membership === 'object' ? { membership } : {}),
		};
	},
);
