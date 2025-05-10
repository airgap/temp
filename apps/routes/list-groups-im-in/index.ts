import { handleListGroupsImIn } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleListGroupsImIn((_, { requester }) =>
	Promise.all([
		pg
			.selectFrom('groups')
			.selectAll()
			.innerJoin('groupMemberships', 'groupMemberships.group', 'groups.id')
			.where('groupMemberships.user', '=', requester)
			.execute(),
		pg
			.selectFrom('groupMemberships')
			.selectAll()
			.where('user', '=', requester)
			.execute(),
	]).then(([groups, groupMemberships]) => ({
		groups,
		groupMemberships,
	})),
);
