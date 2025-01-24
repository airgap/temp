import { handleListGroups } from '@lyku/handles';

export default handleListGroups(
	async ({ filter, substring }, { db, requester }) => {
		let groupsQuery = db.selectFrom('groups').selectAll();

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

		const memberships = await db
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
