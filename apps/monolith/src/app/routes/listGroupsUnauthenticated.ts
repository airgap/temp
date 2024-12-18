import { Group, monolith } from 'models';
import { useContract } from '../Contract';
import { Table, Sequence } from 'rethinkdb';

export const listGroupsUnauthenticated = useContract(
	monolith.listGroupsUnauthenticated,
	({ substring, skip, limit }, { tables, connection }) => {
		let selector: Table<Group> | Sequence<Group> = tables.groups;
		if (substring) {
			const down = substring.toLowerCase();
			selector = selector.filter((g) => g('slug').contains(down));
		}
		return selector
			.slice(skip ?? 0, limit ?? 20)
			.coerceTo('array')
			.run(connection);
	},
);
