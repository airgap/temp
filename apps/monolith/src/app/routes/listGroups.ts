import { Group, monolith } from 'models';
import { useContract } from '../Contract';
import { Table, Sequence } from 'rethinkdb';

export const listGroups = useContract(
	monolith.listGroups,
	async ({ substring, filter }, { tables, connection }, { userId }) => {
		let selector: Table<Group> | Sequence<Group> = tables.groups;
		const memberships = await tables.groupMemberships
			.getAll(userId, { index: 'user' })
			.coerceTo('array')
			.run(connection);
		switch (filter) {
			case 'iCreated':
				selector = selector.getAll(userId, { index: 'creator' });
				break;
			case 'iOwn':
				selector = selector.getAll(userId, { index: 'owner' });
				break;
			case 'imIn':
				selector = selector.getAll(memberships.map((m) => m.id));
				break;
		}
		if (substring) {
			const down = substring.toLowerCase();
			selector = selector.filter((g) => g('slug').contains(down));
		}
		const groups = await selector.coerceTo('array').run(connection);
		return { memberships, groups };
	},
);
