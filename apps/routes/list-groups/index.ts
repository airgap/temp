import { handleListGroups } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleListGroups(
	async ({ filter, substring }, { requester }) => {
		let groupsQuery = pg.selectFrom('groups').selectAll();

		if (filter === 'iCreated') {
			groupsQuery = groupsQuery.where('creator', '=', requester);
		} else if (filter === 'iOwn') {
			groupsQuery = groupsQuery.where('owner', '=', requester);
		} else if (filter === 'imIn') {
			groupsQuery = groupsQuery
				.innerJoin('groupMemberships', 'groups.id', 'groupMemberships.group')
				.where('groupMemberships.user', '=', requester);
		}

		if (substring) {
			groupsQuery = groupsQuery.where('name', 'like', `%${substring}%`);
		}

		const groups = await groupsQuery.execute();

		const memberships = await pg
			.selectFrom('groupMemberships')
			.selectAll()
			.where('user', '=', requester)
			.where(
				'group',
				'in',
				groups.map((g) => g.id),
			)
			.execute();

		return {
			memberships,
			groups,
		};
	},
);
