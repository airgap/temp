import * as monolith from 'monolith-api-models';
import { useContract } from '../Contract';

export const listGroupsICreated = useContract(
	monolith.listGroupsICreated,
	(_, { tables, connection }, { userId }) =>
		tables.groups
			.getAll(userId, {
				index: 'creatorId',
			})
			.coerceTo('array')
			.run(connection),
);
