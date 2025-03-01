import { handleListGroupsImIn } from '@lyku/handles';

export default handleListGroupsImIn((_, { db, requester }) =>
	Promise.all([
		db
			.selectFrom('groups')
			.selectAll()
			.innerJoin('groupMemberships', 'groupMemberships.group', 'groups.id')
			.where('groupMemberships.user', '=', requester)
			.execute(),
		db
			.selectFrom('groupMemberships')
			.selectAll()
			.where('user', '=', requester)
			.execute(),
	]).then(([groups, groupMemberships]) => ({
		groups,
		groupMemberships,
	})),
);
