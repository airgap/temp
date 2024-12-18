import { useContract } from '../Contract';
import { monolith } from 'models';

export const getGroups = useContract(
	monolith.getGroups,
	(ids, { tables, connection }) =>
		tables.groups
			.getAll(...ids)
			.coerceTo('array')
			.run(connection),
);
